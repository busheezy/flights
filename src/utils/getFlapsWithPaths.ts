import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Flap, FlapWithPath } from '../types/Flap';
import YAML from 'yaml';
import pMap from 'p-map';

export async function getFlapsWithPaths(flapNames: string[]) {
  const flapFiles = await pMap(flapNames, async (flapName) => {
    const flapPath = path.join(
      __dirname,
      '..',
      '.flights',
      'flaps',
      `${flapName}/flap.yaml`,
    );

    const flapFile = await fs.readFile(flapPath, 'utf-8');
    const flap = YAML.parse(flapFile) as Flap;

    return {
      ...flap,
      path: flapName,
    } as FlapWithPath;
  });

  return flapFiles;
}
