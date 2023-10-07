import 'dotenv/config';
import { parseEnv } from 'znv';
import { z } from 'zod';

export const env = parseEnv(process.env, {
  PTERO_URL: z.string().url(),
  PTERO_API_KEY: z.string(),
  USERNAME: z.string(),
  PASSWORD: z.string(),
});
