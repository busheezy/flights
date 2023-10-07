import * as path from 'node:path';
import { ConnectedServer } from './types';
import { FlapWithPath } from './types/Flap';
import Bluebird from 'bluebird';
import { loadPrompts } from './loadPrompts';

import { fileUpload } from './actions/fileUpload';
import { fileDownload } from './actions/fileDownload';
import { folderUpload } from './actions/folderUpload';
import { folderDownload } from './actions/folderDownload';

export async function runActions(
  connectedServers: ConnectedServer[],
  flaps: FlapWithPath[],
) {
  await Bluebird.mapSeries(connectedServers, async (connectedServer) => {
    console.log(`Running actions on ${connectedServer.server.attributes.name}`);

    await Bluebird.mapSeries(flaps, async (flap) => {
      console.log(`Running flap: ${flap.name}`);

      const promptVars = await loadPrompts(flap.prompts);
      const flapPath = path.join(
        __dirname,
        '..',
        '.flights',
        'flaps',
        flap.path,
      );

      await Bluebird.mapSeries(flap.actions, async (action) => {
        console.log(`Running action: ${action.type}`);

        if (action.type === 'file-upload') {
          await fileUpload(action, connectedServer, flapPath, promptVars);
        }

        if (action.type === 'file-download') {
          await fileDownload(action, connectedServer, flapPath);
        }

        if (action.type === 'folder-upload') {
          await folderUpload(action, connectedServer, flapPath);
        }

        if (action.type === 'folder-download') {
          await folderDownload(action, connectedServer, flapPath);
        }
      });
    });
  });
}
