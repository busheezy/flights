export interface Flight {
  name: string;
  flaps: string[];
  startup_vars?: StartupVar[];
}

export type Flights = Flight[];

export interface StartupVar {
  key: string;
  value: string;
}
