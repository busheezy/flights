import Bluebird from 'bluebird';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { selectFlight } from '../prompts/selectFlight';
import { selectServers } from '../prompts/selectServers';
import { getFlapsWithPathsFromFlight } from '../utils/getFlapsFromFlight';
import { loadPrompts } from '../utils/loadPrompts';
import { FlapWithPath, Prompt } from '../types/Flap';
import { Server } from '../types/ptero/Server';
import { PromptVars } from '../types';
import { ServerConfig } from '../types/ServerConfig';
import { logger } from '../utils/logger';

const serversPath = path.join(__dirname, '..', '..', '.flights', 'servers');

async function getPromptVarsFromFlaps(flaps: FlapWithPath[]) {
  const prompts: Prompt[] = flaps.reduce(
    (acc: Prompt[], flap: FlapWithPath) => [...acc, ...flap.prompts],
    [],
  );

  const uniquePrompts = prompts.filter(
    (prompt, index, self) =>
      index === self.findIndex((p) => p.name === prompt.name),
  );

  const promptVars = await loadPrompts(uniquePrompts);
  return promptVars;
}

async function createServerConfig(
  server: Server,
  flightName: string,
  promptVars: PromptVars,
) {
  const serverConfigPath = path.join(
    serversPath,
    `${server.attributes.identifier}.json`,
  );

  const serverConfig: ServerConfig = {
    identifier: server.attributes.identifier,
    flightName,
    promptVars,
  };

  const serverConfigJson = JSON.stringify(serverConfig, null, 2);

  await fs.writeFile(serverConfigPath, serverConfigJson);
}

export async function configureServersCmd() {
  const selectedServers = await selectServers();

  await Bluebird.mapSeries(selectedServers, async (server) => {
    const flight = await selectFlight();
    const flapsWithPath = await getFlapsWithPathsFromFlight(flight);
    logger.info(`Configuring: ${server.attributes.name}`);
    const promptVars = await getPromptVarsFromFlaps(flapsWithPath);
    await createServerConfig(server, flight.name, promptVars);
  });
}
