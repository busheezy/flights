import * as path from 'node:path';
import { ConnectedServer } from './types';
import { FlapWithPath } from './types/Flap';
import Bluebird from 'bluebird';

export async function runActions(
  connectedServers: ConnectedServer[],
  flaps: FlapWithPath[],
) {
  await Bluebird.mapSeries(connectedServers, async (connectedServer) => {
    console.log(`Running actions on ${connectedServer.server.attributes.name}`);

    await Bluebird.mapSeries(flaps, async (flap) => {
      console.log(`Running flap: ${flap.name}`);

      const flapsPath = path.join(__dirname, '..', '.flights', 'flaps');

      await Bluebird.mapSeries(flap.actions, async (action) => {
        console.log(`Running action: ${action.type}`);

        if (action.type === 'file-upload') {
          const fromPath = path.join(flapsPath, flap.path, action.from);

          console.log(`From: ${fromPath}`);
          console.log(`To: ${action.to}`);

          await connectedServer.connection.putFile(fromPath, action.to);
        }

        if (action.type === 'file-download') {
          console.log(`From: ${action.from}`);
          console.log(`To: ${action.to}`);

          await connectedServer.connection.getFile(action.from, action.to);
        }

        if (action.type === 'folder-upload') {
          console.log(`From: ${action.from}`);
          console.log(`To: ${action.to}`);

          await connectedServer.connection.putDirectory(action.from, action.to);
        }

        if (action.type === 'folder-download') {
          console.log(`From: ${action.from}`);
          console.log(`To: ${action.to}`);

          await connectedServer.connection.getDirectory(action.from, action.to);
        }
      });
    });
  });
}
