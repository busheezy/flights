export interface PteroServersResponse {
  data: Server[];
}

export interface Server {
  attributes: ServerAttributes;
}

export interface ServerAttributes {
  server_owner: boolean;
  identifier: string;
  uuid: string;
  name: string;
  node: string;
  sftp_details: SftpDetails;
  description: string;
  is_suspended: boolean;
  is_installing: boolean;
}

export interface SftpDetails {
  ip: string;
  port: number;
}
