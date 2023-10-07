import { ActionFolderUpload } from '../types/Flap';
import * as path from 'node:path';
import { ConnectedServer } from '../types';

export async function folderUpload(
  action: ActionFolderUpload,
  connectedServer: ConnectedServer,
  flapPath: string,
) {
  const fromPath = path.join(flapPath, action.from);

  console.log(`From: ${action.from}`);
  console.log(`To: ${action.to}`);

  await connectedServer.connection.putDirectory(fromPath, action.to);
}
