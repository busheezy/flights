import { checkbox } from '@inquirer/prompts';
import { ServerConfig } from '../types/ServerConfig';
import Bluebird from 'bluebird';
import { Server } from '../types/ptero/Server';

export async function selectServerConfigs(
  serverConfigs: ServerConfig[],
  servers: Server[],
) {
  const serversWithConfigs = await Bluebird.mapSeries(
    serverConfigs,
    async (serverConfig) => {
      const foundServer = servers.find(
        (server) => server.attributes.identifier === serverConfig.identifier,
      );

      if (!foundServer) {
        throw new Error('Server not found');
      }

      return foundServer;
    },
  );

  const selectedServerConfigs = await checkbox({
    message: 'Select server config to delete:',
    choices: serversWithConfigs.map((server) => ({
      name: `[${server.attributes.identifier}] ${server.attributes.name}`,
      value: server.attributes.identifier,
    })),
    loop: false,
  });

  return selectedServerConfigs;
}
