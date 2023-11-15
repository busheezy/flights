import { Server } from '../types/ptero/Server';

export function sortServersByName(servers: Server[]) {
  const sortedServers = servers.sort((a, b) => {
    if (a.attributes.name < b.attributes.name) return -1;
    if (a.attributes.name > b.attributes.name) return 1;
    return 0;
  });

  return sortedServers;
}
