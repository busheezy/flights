import { NodeSSH } from 'node-ssh';
import { Server } from './server';

export interface ConnectedServer {
  server: Server;
  connection: NodeSSH;
}

export type PromptVars = Record<string, string>;
