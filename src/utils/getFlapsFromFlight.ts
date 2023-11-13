import Bluebird from 'bluebird';
import * as path from 'node:path';
import YAML from 'yaml';
import { readFile } from 'node:fs/promises';

import { Flight } from '../types/Flights';
import { Flap, FlapWithPath } from '../types/Flap';

export async function getFlapsWithPathsFromFlight(
  flight: Flight,
): Promise<FlapWithPath[]> {
  return await Bluebird.map(flight.flaps, async (flapName) => {
    const flapPath = path.join(
      __dirname,
      '..',
      '..',
      '.flights',
      'flaps',
      `${flapName}/flap.yaml`,
    );

    const flapFile = await readFile(flapPath, 'utf-8');
    const flap = YAML.parse(flapFile) as Flap;

    const flapWithPath = {
      ...flap,
      path: flapName,
    };

    return flapWithPath;
  });
}
