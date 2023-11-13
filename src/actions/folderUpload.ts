import { ActionFolderUpload } from '../types/Flap';
import * as path from 'node:path';
import { logger } from '../utils/logger';
import { NodeSSH } from 'node-ssh';

export async function folderUpload(
  action: ActionFolderUpload,
  connection: NodeSSH,
  flapPath: string,
) {
  const fromPath = path.join(flapPath, action.from);

  logger.debug(`From: ${action.from}`);
  logger.debug(`To: ${action.to}`);

  await connection.putDirectory(fromPath, action.to);
}
