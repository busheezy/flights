import * as path from 'node:path';
import YAML from 'yaml';
import { readFile } from 'node:fs/promises';
import { Flight } from '../types/Flights';
import { select } from '@inquirer/prompts';
import { ServerConfig } from '../types/ServerConfig';

async function getFlights() {
  const flightsPath = path.join(
    __dirname,
    '..',
    '..',
    '.flights',
    'flights.yaml',
  );
  const flightsFile = await readFile(flightsPath, 'utf-8');
  const flights = YAML.parse(flightsFile) as Flight[];

  return flights;
}

export async function selectFlight(
  serverConfig: ServerConfig | null,
): Promise<Flight> {
  const flights = await getFlights();

  const flightSelection = await select({
    message: 'Select flight:',
    choices: flights.map((flight) => {
      return {
        name: flight.name,
        value: flight.name,
      };
    }),
    default: serverConfig?.flightName,
  });

  const flight = flights.find((flight) => flight.name === flightSelection);

  if (!flight) {
    throw new Error('Flight not found');
  }

  return flight;
}
