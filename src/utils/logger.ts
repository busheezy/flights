import colorLogger from 'node-color-log';

export const logger = {
  info: (...message: unknown[]) => {
    colorLogger.info(...message);
  },
  debug: (...message: unknown[]) => {
    colorLogger.debug(...message);
  },
  error: (...message: unknown[]) => {
    console.log(...message);
  },
};
