export interface GetPortOptions {
  name: string;
  random: boolean;
  port: number;
  ports: number[];
  portRange: [fromInclusive: number, toExclusive: number];
  alternativePortRange: [fromInclusive: number, toExclusive: number];
  host: string;
  verbose?: boolean;
  public?: boolean;
}

export interface WaitForPortOptions {
  host?: HostAddress;
  delay?: number;
  retries?: number;
}

export type GetPortInput = Partial<GetPortOptions> | number | string;

export type HostAddress = undefined | string;

export type PortNumber = number;
