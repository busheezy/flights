import { FlapWithPath } from './types/Flap';
import { ConnectedServer } from './types';
import Bluebird from 'bluebird';
import { env } from './env';
import { Flight, StartupVar } from './types/Flights';
import { ptero } from './ptero';
import { runActions } from './runActions';

async function connectServers(connectedServers: ConnectedServer[]) {
  await Bluebird.map(connectedServers, async (connectedServer) => {
    const { server, connection } = connectedServer;

    await connection.connect({
      host: server.attributes.sftp_details.ip,
      port: server.attributes.sftp_details.port,
      username: `${env.USERNAME}.${server.attributes.identifier}`,
      password: env.PASSWORD,
    });
  });
}

function disconnectServers(connectedServers: ConnectedServer[]) {
  connectedServers.map((connectedServer) =>
    connectedServer.connection.dispose(),
  );
}

async function updateVars(
  connectedServers: ConnectedServer[],
  startupVars: StartupVar[],
) {
  await Bluebird.map(connectedServers, async (connectedServer) => {
    const { server } = connectedServer;

    await Bluebird.map(startupVars, async (startupVar) => {
      await ptero.put(
        `/servers/${server.attributes.identifier}/startup/variable`,
        startupVar,
      );
    });
  });
}

async function changePowerState(
  connectedServers: ConnectedServer[],
  state: 'start' | 'stop' | 'restart | kill',
) {
  await Bluebird.map(connectedServers, async (connectedServer) => {
    const { server } = connectedServer;

    await ptero.post(`/servers/${server.attributes.identifier}/power`, {
      signal: state,
    });
  });
}

export async function runFlight(
  flight: Flight,
  connectedServers: ConnectedServer[],
  flaps: FlapWithPath[],
  restart: boolean,
) {
  try {
    console.log(`Starting flight: ${flight.name}`);

    await connectServers(connectedServers);
    await updateVars(connectedServers, flight.startup_vars);

    if (restart) {
      await changePowerState(connectedServers, 'stop');
      console.log('Waiting 5 seconds for servers to power off.');
      await Bluebird.delay(5_000);
    }

    await runActions(connectedServers, flaps);

    if (restart) {
      await changePowerState(connectedServers, 'start');
      console.log('Powering on servers.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    disconnectServers(connectedServers);
  }
}
