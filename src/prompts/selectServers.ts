import { checkbox } from '@inquirer/prompts';
import { getServers } from '../ptero';
import { Server } from '../types/ptero/Server';

export async function selectServers(): Promise<Server[]> {
  const servers = await getServers();

  const selectedServerIds = await checkbox({
    message: 'Select servers:',
    choices: servers.map((server) => ({
      name: server.attributes.name,
      value: server.attributes.identifier,
    })),
  });

  const selectedServers = servers.filter((server) =>
    selectedServerIds.includes(server.attributes.identifier),
  );

  return selectedServers;
}
