import Bluebird from 'bluebird';
import { input, select, confirm } from '@inquirer/prompts';
import { Prompt } from '../types/Flap';
import { PromptVars } from '../types';
import { ServerConfig } from '../types/ServerConfig';

const ENV_PREFIX = 'FLIGHT_';

export async function loadPrompts(
  prompts: Prompt[],
  serverConfig: ServerConfig | null,
): Promise<PromptVars> {
  const promptVars: PromptVars = {};

  await Bluebird.mapSeries(prompts, async (prompt) => {
    const priorValue = serverConfig
      ? serverConfig.promptVars[`${ENV_PREFIX}${prompt.name}`]
      : null;

    if (prompt.type === 'input') {
      const response = await input({
        ...prompt,
        default: priorValue || prompt.default,
      });

      promptVars[`${ENV_PREFIX}${prompt.name}`] = response;
    }

    if (prompt.type === 'select') {
      const response = await select({
        message: prompt.message,
        choices: prompt.choices.map((choice) => ({
          value: choice,
        })),
        default: priorValue,
      });

      promptVars[`${ENV_PREFIX}${prompt.name}`] = response;
    }

    if (prompt.type === 'confirm') {
      const response = await confirm({
        ...prompt,
        default: priorValue == 'true' || prompt.default === 'true',
      });

      promptVars[`${ENV_PREFIX}${prompt.name}`] = response ? 'true' : 'false';
    }
  });

  return promptVars;
}
