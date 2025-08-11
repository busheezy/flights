import axios, { Axios, isAxiosError } from 'axios';
import { env } from './env';
import { StartupVar } from './types/Flights';
import { PteroServersResponse } from './types/ptero/Server';
import { PteroServerResources } from './types/ptero/ServerResources';
import axiosRetry from 'axios-retry';
import pMapSeries from 'p-map-series';
import { delay } from './utils/delay';

export const ptero = axios.create({
  baseURL: `${env.PTERO_URL}/api/client`,
  headers: {
    Authorization: `Bearer ${env.PTERO_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'Application/vnd.pterodactyl.v1+json',
  },
});

axiosRetry(ptero, {
  retries: 10,
  retryDelay: axiosRetry.exponentialDelay,
  onRetry(retryCount, error, requestConfig) {
    console.log(
      `Retry attempt #${retryCount} for ${requestConfig.url}: ${error.message}`,
    );
  },
});

export async function updateVars(
  identifier: string,
  startupVars: StartupVar[],
) {
  await pMapSeries(startupVars, async (startupVar) => {
    await ptero.put(`/servers/${identifier}/startup/variable`, startupVar);
    await delay(1000);
  });
}

export async function changePowerState(
  identifier: string,
  state: 'start' | 'stop' | 'restart' | 'kill',
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
