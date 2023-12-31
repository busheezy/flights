export interface PteroServerResources {
  object: string;
  attributes: ServerResourcesAttributes;
}

export interface ServerResourcesAttributes {
  current_state: string;
  is_suspended: boolean;
  resources: Resources;
}

export interface Resources {
  memory_bytes: number;
  cpu_absolute: number;
  disk_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
}
