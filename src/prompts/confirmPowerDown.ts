import { confirm } from '@inquirer/prompts';

export async function confirmPowerDown() {
  const powerDown = await confirm({
    message: 'Do you want to power down the servers?',
    default: true,
  });

  return powerDown;
}
