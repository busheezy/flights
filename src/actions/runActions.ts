import * as path from 'node:path';
import { FlapWithPath } from '../types/Flap';

import { fileUpload } from './fileUpload';
import { fileDownload } from './fileDownload';
import { folderUpload } from './folderUpload';
import { folderDownload } from './folderDownload';
import { logger } from '../utils/logger';
import { NodeSSH } from 'node-ssh';
import { Server } from '../types/ptero/Server';
import { ServerConfig } from '../types/ServerConfig';
import pMapSeries from 'p-map-series';

export async function runActions(
  serverConfig: ServerConfig,
  server: Server,
  connection: NodeSSH,
  flaps: FlapWithPath[],
) {
  await pMapSeries(flaps, async (flap) => {
    logger.log(`Running flap: ${flap.name} on ${server.attributes.name}`);

    const flapPath = path.join(
      __dirname,
      '..',
      '..',
      '.flights',
      'flaps',
      flap.path,
    );

    await pMapSeries(flap.actions, async (action) => {
      logger.debug(`Running action: ${action.type}`);

      if (action.type === 'file-upload') {
        await fileUpload(action, connection, flapPath, serverConfig.promptVars);
      }

      if (action.type === 'file-download') {
        await fileDownload(action, connection, flapPath);
      }

      if (action.type === 'folder-upload') {
        await folderUpload(action, connection, flapPath);
      }

      if (action.type === 'folder-download') {
        await folderDownload(action, connection, flapPath);
      }
    });
  });
}
