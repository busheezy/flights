import { ActionFileUpload } from '../types/Flap';
import * as path from 'node:path';
import { ConnectedServer, PromptVars } from '../types';
import { getTmpFolder } from '../utils/getTmpFolder';
import * as fs from 'fs-extra';
import { template } from '../template';

export async function fileUpload(
  action: ActionFileUpload,
  connectedServer: ConnectedServer,
  flapPath: string,
  promptVars: PromptVars,
) {
  const fromPath = path.join(flapPath, action.from);

  console.log(`From: ${fromPath}`);
  console.log(`To: ${action.to}`);
  console.log(`Template: ${action.template ? 'yes' : 'no'}`);

  if (action.template) {
    const fromFile = await fs.readFile(fromPath, 'utf-8');
    const templatedFile = await template(fromFile, promptVars);
    const temporaryFolder = await getTmpFolder();

    await fs.mkdirp(temporaryFolder);

    const temporaryTemplatedFilePath = path.join(temporaryFolder, action.from);
    await fs.writeFile(temporaryTemplatedFilePath, templatedFile);

    await connectedServer.connection.putFile(
      temporaryTemplatedFilePath,
      action.to,
    );
  } else {
    await connectedServer.connection.putFile(fromPath, action.to);
  }
}
