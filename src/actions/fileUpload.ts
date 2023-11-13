import { ActionFileUpload } from '../types/Flap';
import * as path from 'node:path';
import { PromptVars } from '../types';
import { getTmpFolder } from '../utils/getTmpFolder';
import * as fs from 'fs-extra';
import { template } from '../template';
import { logger } from '../utils/logger';
import { NodeSSH } from 'node-ssh';

export async function fileUpload(
  action: ActionFileUpload,
  connection: NodeSSH,
  flapPath: string,
  promptVars: PromptVars,
) {
  const fromPath = path.join(flapPath, action.from);

  logger.debug(`From: ${fromPath}`);
  logger.debug(`To: ${action.to}`);
  logger.debug(`Template: ${action.template ? 'yes' : 'no'}`);

  if (action.template) {
    const fromFile = await fs.readFile(fromPath, 'utf-8');
    const templatedFile = await template(fromFile, promptVars);
    const temporaryFolder = await getTmpFolder();

    await fs.mkdirp(temporaryFolder);

    const temporaryTemplatedFilePath = path.join(temporaryFolder, action.from);
    await fs.writeFile(temporaryTemplatedFilePath, templatedFile);

    await connection.putFile(temporaryTemplatedFilePath, action.to);
  } else {
    await connection.putFile(fromPath, action.to);
  }
}
