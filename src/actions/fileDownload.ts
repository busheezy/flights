import { ActionFileDownload } from '../types/Flap';
import * as path from 'node:path';
import { logger } from '../utils/logger';
import { NodeSSH } from 'node-ssh';

export async function fileDownload(
  action: ActionFileDownload,
  connection: NodeSSH,
  flapPath: string,
) {
  const toPath = path.join(flapPath, action.to);

  logger.debug(`From: ${action.from}`);
  logger.debug(`To: ${toPath}`);

  await connection.getFile(action.from, toPath);
}
