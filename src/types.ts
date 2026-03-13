export interface GetPortOptions {
  name: string;
  random: boolean;
  port: number;
  ports: number[] | readonly number[];
  portRange:
    | [fromInclusive: number, toInclusive: number]
    | readonly [fromInclusive: number, toInclusive: number];
  alternativePortRange:
    | [fromInclusive: number, toInclusive: number]
    | readonly [fromInclusive: number, toInclusive: number];
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
