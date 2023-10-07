import { ActionFolderDownload } from '../types/Flap';
import * as path from 'node:path';
import { ConnectedServer } from '../types';

export async function folderDownload(
  action: ActionFolderDownload,
  connectedServer: ConnectedServer,
  flapPath: string,
) {
  const toPath = path.join(flapPath, action.to);

  console.log(`From: ${action.from}`);
  console.log(`To: ${action.to}`);

  await connectedServer.connection.getDirectory(action.from, toPath);
}
