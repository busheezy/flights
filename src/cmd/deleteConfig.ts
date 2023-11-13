import Bluebird from 'bluebird';
import { getServerConfigs } from '../utils/getServerConfigs';
import { getServers } from '../ptero';
import { selectServerConfigs } from '../prompts/selectServerConfigs';
import { areYouSure } from '../prompts/confirmAreYouSure';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { logger } from '../utils/logger';

const serversPath = path.join(__dirname, '..', '..', '.flights', 'servers');

export async function deleteConfigCmd() {
  const serverConfigs = await getServerConfigs();
  const servers = await getServers();

  const selectedServerConfigs = await selectServerConfigs(
    serverConfigs,
    servers,
  );

  const sure = await areYouSure();

  if (!sure) {
    return;
  }

  await Bluebird.mapSeries(selectedServerConfigs, async (serverConfig) => {
    const serverConfigPath = path.join(serversPath, `${serverConfig}.json`);
    logger.info(`Deleting ${serverConfigPath}`);
    await fs.unlink(serverConfigPath);
  });
}
