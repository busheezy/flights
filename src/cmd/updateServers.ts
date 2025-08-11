import { areYouSure } from '../prompts/confirmAreYouSure';
import { getServerConfigs } from '../utils/getServerConfigs';
import { NodeSSH } from 'node-ssh';
import {
  changePowerState,
  getServerStatus,
  getServers,
  sendCmd,
  updateVars,
} from '../ptero';
import { selectServerConfigs } from '../prompts/selectServerConfigs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { env } from '../env';
import { getFlights } from '../utils/getFlights';
import { confirmPowerDown } from '../prompts/confirmPowerDown';
import { runActions } from '../actions/runActions';
import { getFlapsWithPathsFromFlight } from '../utils/getFlapsFromFlight';
import { logger } from '../utils/logger';
import promiseRetry from 'promise-retry';
import { ServerConfig } from '../types/ServerConfig';
import pMapSeries from 'p-map-series';
import { delay } from '../utils/delay';

const serversPath = path.join(__dirname, '..', '..', '.flights', 'servers');

const SHUT_DOWN_MESSAGE =
  'say The server will restart to apply updates. It should be back immediately.';

export async function updateServersCmd() {
  const serverConfigs = await getServerConfigs();
  const servers = await getServers();

  const selectedServerConfigs = await selectServerConfigs(
    serverConfigs,
    servers,
  );

  const powerDown = await confirmPowerDown();

  const sure = await areYouSure();

  if (!sure) {
    return;
  }

  await pMapSeries(selectedServerConfigs, async (serverConfigName) => {
    const serverConfigPath = path.join(serversPath, `${serverConfigName}.json`);
    const serverConfigJson = await fs.readFile(serverConfigPath, 'utf-8');
    const serverConfig = JSON.parse(serverConfigJson) as ServerConfig;

    const server = servers.find(
      (s) => s.attributes.identifier === serverConfigName,
    );

    if (!server) {
      throw new Error(`Server with name ${serverConfigName} not found.`);
    }

    const status = await getServerStatus(server.attributes.identifier);

    const flights = await getFlights();
    const flight = flights.find(
      (flight) => flight.name === serverConfig.flightName,
    );

    if (!flight) {
      throw new Error(`Flight with name ${serverConfig.flightName} not found.`);
    }

    let poweredDown = false;
    if (powerDown && status === 'running') {
      logger.info(`Powering down ${server.attributes.identifier}!`);

      poweredDown = true;

      await sendCmd(server.attributes.identifier, SHUT_DOWN_MESSAGE);
      await delay(1000);
      await sendCmd(server.attributes.identifier, SHUT_DOWN_MESSAGE);
      await delay(1000);
      await sendCmd(server.attributes.identifier, SHUT_DOWN_MESSAGE);
      await delay(3000);

      await changePowerState(server.attributes.identifier, 'stop');
      await delay(1000);
    }

    const ssh = new NodeSSH();

    const connection = await promiseRetry(async (retry) => {
      return await ssh
        .connect({
          host: server.attributes.sftp_details.ip,
          port: server.attributes.sftp_details.port,
          username: `${env.USERNAME}.${server.attributes.identifier}`,
          password: env.PASSWORD,
        })
        .catch(retry);
    });

    const flaps = await getFlapsWithPathsFromFlight(flight);
    await runActions(serverConfig, server, connection, flaps);

    const startupVars = flight.startup_vars ?? [];
    await updateVars(serverConfig.identifier, startupVars);

    if (poweredDown) {
      logger.info(`Powering up ${server.attributes.identifier}!`);
      await changePowerState(server.attributes.identifier, 'start');
    }
  });
}
