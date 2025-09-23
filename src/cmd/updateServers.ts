import { areYouSure } from '../prompts/confirmAreYouSure';
import { getServerConfigs } from '../utils/getServerConfigs';
import { NodeSSH } from 'node-ssh';
import {
  getServerStatus,
  getServers,
  sendCmd,
  sendPowerSignalAndWaitForPowerState,
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
import promiseRetry from 'promise-retry';
import { ServerConfig } from '../types/ServerConfig';
import { delay } from '../utils/delay';
import pMap from 'p-map';

const serversPath = path.join(__dirname, '..', '..', '.flights', 'servers');

const WARNING_MESSAGE_COMMAND = 'say The server will restart to apply changes.';

async function sendPowerOffNotification(serverIdentifier: string) {
  await sendCmd(serverIdentifier, WARNING_MESSAGE_COMMAND);
  await delay(5000);
}

export async function updateServersCmd() {
  const serverConfigs = await getServerConfigs();
  const servers = await getServers();
  const serverIndex = new Map(servers.map((s) => [s.attributes.identifier, s]));
  const flights = await getFlights();

  const selectedServerConfigs = await selectServerConfigs(
    serverConfigs,
    servers,
  );

  const powerDown = await confirmPowerDown();

  const sure = await areYouSure();

  if (!sure) {
    return;
  }

  await pMap(
    selectedServerConfigs,
    async (serverConfigName) => {
      const serverConfigPath = path.join(serversPath, `${serverConfigName}.json`);
      const serverConfigJson = await fs.readFile(serverConfigPath, 'utf-8');
      const serverConfig = JSON.parse(serverConfigJson) as ServerConfig;

      const server = serverIndex.get(serverConfigName);

      if (!server) {
        throw new Error(`Server with name ${serverConfigName} not found.`);
      }

      let poweredDown = false;

      if (powerDown) {
        const status = await getServerStatus(server.attributes.identifier);
        if (status === 'running') {
          poweredDown = true;
          await sendPowerOffNotification(server.attributes.identifier);
          await sendPowerSignalAndWaitForPowerState(
            server.attributes.identifier,
            'stop',
            'offline',
          );
          await delay(1000);
        }
      }

      const flight = flights.find((f) => f.name === serverConfig.flightName);

      if (!flight) {
        throw new Error(`Flight with name ${serverConfig.flightName} not found.`);
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
        await sendPowerSignalAndWaitForPowerState(
          server.attributes.identifier,
          'start',
          'running',
        );
      }
    },
    {
      concurrency: 5,
    },
  );
}
