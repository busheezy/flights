import { checkbox } from '@inquirer/prompts';
import { getServers } from '../ptero';
import { Server } from '../types/ptero/Server';
import { sortServersByName } from '../utils/sortServersByName';

export async function selectServers(): Promise<Server[]> {
  const servers = await getServers();
  const sortedServers = sortServersByName(servers);

  const selectedServerIds = await checkbox({
    message: 'Select servers:',
    choices: sortedServers.map((server) => ({
      name: server.attributes.name,
      value: server.attributes.identifier,
    })),
    loop: false,
  });

  const selectedServers = sortedServers.filter((server) =>
    selectedServerIds.includes(server.attributes.identifier),
  );

  return selectedServers;
}
