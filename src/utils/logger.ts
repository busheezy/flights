import colorLogger from 'node-color-log';

colorLogger.setDate(() => '');
colorLogger.level = 'info';

export const logger = {
  log: (...message: unknown[]) => {
    colorLogger.log(...message);
  },
  info: (...message: unknown[]) => {
    colorLogger.info(...message);
  },
  debug: (...message: unknown[]) => {
    colorLogger.debug(...message);
  },
  error: (...message: unknown[]) => {
    console.error(...message);
  },
};
