import { ActionFolderDownload } from '../types/Flap';
import * as path from 'node:path';
import { logger } from '../utils/logger';
import { NodeSSH } from 'node-ssh';

export async function folderDownload(
  action: ActionFolderDownload,
  connection: NodeSSH,
  flapPath: string,
) {
  const toPath = path.join(flapPath, action.to);

  logger.debug(`From: ${action.from}`);
  logger.debug(`To: ${action.to}`);

  await connection.getDirectory(action.from, toPath);
}
