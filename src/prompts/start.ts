import { select } from '@inquirer/prompts';

export enum StartCmdType {
  CONFIGURE_SERVERS,
  UPDATE_SERVERS,
  DELETE_CONFIG,
}

export async function getStartCmd() {
  const startCmdPrompt = await select({
    message: 'Select what you want to do:',
    choices: [
      {
        name: 'Configure Servers',
        value: StartCmdType.CONFIGURE_SERVERS,
      },
      {
        name: 'Update Servers',
        value: StartCmdType.UPDATE_SERVERS,
      },
      {
        name: 'Delete Config',
        value: StartCmdType.DELETE_CONFIG,
      },
    ],
  });

  return startCmdPrompt;
}
