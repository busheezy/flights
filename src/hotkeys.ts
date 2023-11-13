import { logger } from './utils/logger';

process.openStdin().on('keypress', function (_chunk, key) {
  if (key && key.name === 'c' && key.ctrl) {
    logger.info(`'\n\n${'\x1b[31m'}✗${'\x1b[0m'} Exiting...`);
    process.exit();
  }
});
