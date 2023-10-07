import { ActionFileDownload } from '../types/Flap';
import * as path from 'node:path';
import { ConnectedServer } from '../types';

export async function fileDownload(
  action: ActionFileDownload,
  connectedServer: ConnectedServer,
  flapPath: string,
) {
  const toPath = path.join(flapPath, action.to);

  console.log(`From: ${action.from}`);
  console.log(`To: ${toPath}`);

  await connectedServer.connection.getFile(action.from, toPath);
}
