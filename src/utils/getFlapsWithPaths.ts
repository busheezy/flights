import Bluebird from 'bluebird';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Flap, FlapWithPath } from '../types/Flap';
import YAML from 'yaml';

export async function getFlapsWithPaths(flapNames: string[]) {
  const flapFiles = await Bluebird.map(flapNames, async (flapName) => {
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
