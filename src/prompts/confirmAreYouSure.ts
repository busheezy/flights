import { confirm } from '@inquirer/prompts';

export async function areYouSure() {
  const sure = await confirm({
    message: 'Are you sure?',
    default: false,
  });

  return sure;
}
