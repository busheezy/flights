import { configureServersCmd } from './cmd/configureServers';
import { deleteConfigCmd } from './cmd/deleteConfig';
import { updateServersCmd } from './cmd/updateServers';
import { StartCmdType, getStartCmd } from './prompts/start';

import './hotkeys';
import { logger } from './utils/logger';

async function run() {
  const startCmd = await getStartCmd();

  if (startCmd === StartCmdType.CONFIGURE_SERVERS) {
    await configureServersCmd();
  }

  if (startCmd === StartCmdType.UPDATE_SERVERS) {
    await updateServersCmd();
  }

  if (startCmd === StartCmdType.DELETE_CONFIG) {
    await deleteConfigCmd();
  }

  await run();
}

run().catch(logger.error);
