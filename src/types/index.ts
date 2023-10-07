import { NodeSSH } from 'node-ssh';
import { Server } from './server';

export interface ConnectedServer {
  server: Server;
  connection: NodeSSH;
}
