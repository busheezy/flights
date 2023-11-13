import { confirm } from '@inquirer/prompts';

export async function doPowerDown() {
  const powerDown = await confirm({
    message: 'Do you want to power down the servers?',
    default: true,
  });

  return powerDown;
}
