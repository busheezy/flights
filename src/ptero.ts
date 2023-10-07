import axios from 'axios';
import { env } from './env';

export const ptero = axios.create({
  baseURL: `${env.PTERO_URL}/api/client`,
  headers: {
    Authorization: `Bearer ${env.PTERO_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'Application/vnd.pterodactyl.v1+json',
  },
});
