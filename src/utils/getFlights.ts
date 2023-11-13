import * as path from 'node:path';
import YAML from 'yaml';
import { readFile } from 'node:fs/promises';
import { Flight } from '../types/Flights';

export async function getFlights() {
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
