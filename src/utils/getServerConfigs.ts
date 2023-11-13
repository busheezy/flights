import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { ServerConfig } from '../types/ServerConfig';
import Bluebird from 'bluebird';

const serverConfigsPath = path.join(
  __dirname,
  '..',
  '..',
  '.flights',
  'servers',
);

export async function getServerConfigs(): Promise<ServerConfig[]> {
  const serverConfigsPaths = await fs.readdir(serverConfigsPath);

  const serverConfigs = await Bluebird.mapSeries(
    serverConfigsPaths,
    async (serverConfigPath) => {
      const serverConfig = await fs.readFile(
        path.join(serverConfigsPath, serverConfigPath),
        'utf-8',
      );

      return JSON.parse(serverConfig) as ServerConfig;
    },
  );

  return serverConfigs;
}
