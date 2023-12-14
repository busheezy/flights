import { checkbox } from '@inquirer/prompts';
import { ServerConfig } from '../types/ServerConfig';
import { Server } from '../types/ptero/Server';
import { sortServersByName } from '../utils/sortServersByName';

export async function selectServerConfigs(
  serverConfigs: ServerConfig[],
  servers: Server[],
) {
  const serverConfigsThatHaveServer = serverConfigs.filter((serverConfig) => {
    const foundServer = servers.some(
      (server) => server.attributes.identifier === serverConfig.identifier,
    );

    return foundServer;
  });

  const serversWithConfigs = serverConfigsThatHaveServer.map((serverConfig) => {
    const foundServer = servers.find(
      (server) => server.attributes.identifier === serverConfig.identifier,
    );

    if (!foundServer) {
      throw new Error('Server not found');
    }

    return foundServer;
  });

  const sortedServers = sortServersByName(serversWithConfigs);

  const selectedServerConfigs = await checkbox({
    message: 'Select server config:',
    choices: sortedServers.map((server) => ({
      name: server.attributes.name,
      value: server.attributes.identifier,
    })),
    loop: false,
  });

  return selectedServerConfigs;
}
