import * as path from 'node:path';
import * as fs from 'fs-extra';

import { selectFlight } from '../prompts/selectFlight';
import { selectServers } from '../prompts/selectServers';
import { getFlapsWithPathsFromFlight } from '../utils/getFlapsFromFlight';
import { loadPrompts } from '../utils/loadPrompts';
import { FlapWithPath, Prompt } from '../types/Flap';
import { Server } from '../types/ptero/Server';
import { PromptVars } from '../types';
import { ServerConfig } from '../types/ServerConfig';
import { logger } from '../utils/logger';
import pMapSeries from 'p-map-series';

const serversPath = path.join(__dirname, '..', '..', '.flights', 'servers');

async function getPromptsFromFlaps(flaps: FlapWithPath[]) {
  const prompts: Prompt[] = flaps.reduce(
    (acc: Prompt[], flap: FlapWithPath) => [...acc, ...flap.prompts],
    [],
  );

  const uniquePrompts = prompts.filter(
    (prompt, index, self) =>
      index === self.findIndex((p) => p.name === prompt.name),
  );

  return uniquePrompts;
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

async function loadServerConfig(
  identifier: string,
): Promise<ServerConfig | null> {
  const serverConfigPath = path.join(serversPath, `${identifier}.json`);
  const exists = await fs.pathExists(serverConfigPath);

  if (exists) {
    const serverConfigJson = await fs.readFile(serverConfigPath, 'utf-8');
    const serverConfig: ServerConfig = JSON.parse(serverConfigJson);
    return serverConfig;
  }

  return null;
}

export async function configureServersCmd() {
  const selectedServers = await selectServers();

  await pMapSeries(selectedServers, async (server) => {
    logger.info(
      `Configuring: ${server.attributes.name} - ${server.attributes.node}`,
    );

    const serverConfig = await loadServerConfig(server.attributes.identifier);

    const flight = await selectFlight(serverConfig);
    const flapsWithPath = await getFlapsWithPathsFromFlight(flight);
    const prompts = await getPromptsFromFlaps(flapsWithPath);
    const promptVars = await loadPrompts(prompts, serverConfig);
    await createServerConfig(server, flight.name, promptVars);
  });
}
