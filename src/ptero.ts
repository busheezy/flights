import axios from 'axios';
import { env } from './env';
import Bluebird from 'bluebird';
import { StartupVar } from './types/Flights';
import { PteroServersResponse } from './types/ptero/Server';
import { PteroServerResources } from './types/ptero/ServerResources';

export const ptero = axios.create({
  baseURL: `${env.PTERO_URL}/api/client`,
  headers: {
    Authorization: `Bearer ${env.PTERO_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'Application/vnd.pterodactyl.v1+json',
  },
});

export async function updateVars(
  identifier: string,
  startupVars: StartupVar[],
) {
  await Bluebird.map(startupVars, async (startupVar) => {
    await ptero.put(`/servers/${identifier}/startup/variable`, startupVar);
  });
}

export async function changePowerState(
  identifier: string,
  state: 'start' | 'stop' | 'restart | kill',
) {
  await ptero.post(`/servers/${identifier}/power`, {
    signal: state,
  });
}

export async function getServers() {
  const {
    data: { data: servers },
  } = await ptero.get<PteroServersResponse>('');

  return servers;
}

export async function getServerStatus(identifier: string) {
  const { data } = await ptero.get<PteroServerResources>(
    `/servers/${identifier}/resources`,
  );

  return data.attributes.current_state;
}

export async function sendCmd(identifier: string, cmd: string) {
  await ptero.post(`/servers/${identifier}/command`, {
    command: cmd,
  });
}
