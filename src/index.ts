import { ptero } from './ptero';
import Bluebird from 'bluebird';
import { PteroServerResponse } from './types/server';
import { checkbox, confirm, select } from '@inquirer/prompts';
import * as path from 'node:path';
import YAML from 'yaml';
import { Flight } from './types/Flights';
import { readFile } from 'node:fs/promises';
import { runFlight } from './flight';
import { Flap, FlapWithPath } from './types/Flap';
import { NodeSSH } from 'node-ssh';
import { ConnectedServer } from './types';

async function getFlights() {
  const flightsPath = path.join(__dirname, '..', '.flights', 'flights.yaml');
  const flightsFile = await readFile(flightsPath, 'utf-8');
  const flights = YAML.parse(flightsFile) as Flight[];

  return flights;
}

async function run() {
  const {
    data: { data: servers },
  } = await ptero.get<PteroServerResponse>('');

  const flights = await getFlights();

  const serverIdsToRunOn = await checkbox({
    message: 'Select servers to start',
    choices: servers.map((server) => ({
      name: server.attributes.name,
      value: server.attributes.identifier,
    })),
  });

  const restart = await confirm({
    message: 'Shut down servers?',
    default: true,
  });

  const flightSelection = await select({
    message: 'Select flight to start',
    choices: flights.map((flight) => ({
      name: flight.name,
      value: flight.name,
    })),
  });

  console.log();

  const flight = flights.find((flight) => flight.name === flightSelection);

  if (!flight) {
    throw new Error('Flight not found');
  }

  const flapFiles = await Bluebird.map(flight.flaps, async (flapName) => {
    const flapPath = path.join(
      __dirname,
      '..',
      '.flights',
      'flaps',
      `${flapName}/flap.yaml`,
    );

    const flapFile = await readFile(flapPath, 'utf-8');
    const flap = YAML.parse(flapFile) as Flap;

    return {
      ...flap,
      path: flapName,
    } as FlapWithPath;
  });

  const serversToRunOn = serverIdsToRunOn.map((serverId) => {
    const server = servers.find(
      (server) => server.attributes.identifier === serverId,
    );

    if (!server) {
      throw new Error('Server not found');
    }

    return server;
  });

  const connectedServers = await Bluebird.map(
    serversToRunOn,
    async (server) => {
      const ssh = new NodeSSH();

      const connectedServer: ConnectedServer = {
        server,
        connection: ssh,
      };

      return connectedServer;
    },
  );

  await runFlight(flight, connectedServers, flapFiles, restart);
}

run().catch(console.error);
