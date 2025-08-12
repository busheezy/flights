import axios, { Axios, isAxiosError } from 'axios';
import { env } from './env';
import { StartupVar } from './types/Flights';
import { PteroServersResponse } from './types/ptero/Server';
import {
  PteroPowerSignal,
  PteroPowerState,
  PteroServerResources,
} from './types/ptero/ServerResources';
import axiosRetry from 'axios-retry';
import pMapSeries from 'p-map-series';
import { delay } from './utils/delay';
import { logger } from './utils/logger';

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

async function sendPowerSignal(identifier: string, signal: PteroPowerSignal) {
  await ptero.post(`/servers/${identifier}/power`, {
    signal,
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

export async function sendPowerSignalAndWaitForPowerState(
  identifier: string,
  powerSignal: PteroPowerSignal,
  powerStateToWaitFor: PteroPowerState,
) {
  await sendPowerSignal(identifier, powerSignal);

  let attempts = 0;

  async function checkServerState() {
    if (attempts == 0) {
      logger.log(`Setting ${identifier} to ${powerStateToWaitFor}`);
    }

    attempts++;

    if (attempts > 12) {
      throw new Error(
        `Failed to reach power state ${powerStateToWaitFor} for server ${identifier} after 12 attempts`,
      );
    }

    const currentState = await getServerStatus(identifier);

    if (currentState === powerStateToWaitFor) {
      logger.log(`Server ${identifier} is now in state ${powerStateToWaitFor}`);
      return;
    }

    await delay(5_000);
    await checkServerState();
  }

  await checkServerState();
}
