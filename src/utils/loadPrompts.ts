import Bluebird from 'bluebird';
import { input, select, confirm } from '@inquirer/prompts';
import { Prompt } from '../types/Flap';
import { PromptVars } from '../types';

const ENV_PREFIX = 'FLIGHT_';

export async function loadPrompts(prompts: Prompt[]): Promise<PromptVars> {
  const promptVars: PromptVars = {};

  await Bluebird.mapSeries(prompts, async (prompt) => {
    if (prompt.type === 'input') {
      const response = await input(prompt);

      promptVars[`${ENV_PREFIX}${prompt.name}`] = response;
    }

    if (prompt.type === 'select') {
      const response = await select({
        message: prompt.message,
        choices: prompt.choices.map((choice) => ({
          value: choice,
        })),
      });

      promptVars[`${ENV_PREFIX}${prompt.name}`] = response;
    }

    if (prompt.type === 'confirm') {
      const response = await confirm({
        ...prompt,
        default: prompt.default === 'true',
      });

      promptVars[`${ENV_PREFIX}${prompt.name}`] = response ? 'true' : 'false';
    }
  });

  return promptVars;
}
