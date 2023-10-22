import { createServer, AddressInfo } from "node:net";
import { networkInterfaces } from "node:os";
import { isSafePort } from "./unsafe-ports";
import type { PortNumber, HostAddress } from "./types";

export class GetPortError extends Error {
  name = "GetPortError";
  constructor(
    public message: string,
    opts?: any,
  ) {
    super(message, opts);
  }
}

export function _log(verbose: boolean, message: string) {
  if (verbose) {
    console.log(`[get-port] ${message}`);
  }
}

export function _generateRange(
  range: [from: number, to: number],
  random?: boolean,
): number[] {
  const [from, to] = range;
  if (to < from) {
    return [];
  }
  const r = [];
  for (let index = from; index < to; index++) {
    r.push(index);
  }
  // Fisher-Yates shuffle algorithm
  if (random) {
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
  }
  return r;
}

export function _tryPort(
  port: PortNumber,
  host: HostAddress,
): Promise<PortNumber | false> {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.on("error", () => {
      resolve(false);
    });
    server.listen({ port, host }, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => {
        resolve(isSafePort(port) && port);
      });
    });
  });
}

export function _getLocalHosts(additional: HostAddress[]): HostAddress[] {
  const hosts = new Set<HostAddress>(additional);
  for (const _interface of Object.values(networkInterfaces())) {
    for (const config of _interface || []) {
      if (
        config.address &&
        !config.internal &&
        !config.address.startsWith("fe80::") // Link-Local
      ) {
        hosts.add(config.address);
      }
    }
  }
  return [...hosts];
}

export async function _findPort(
  ports: number[],
  host: HostAddress,
): Promise<PortNumber> {
  for (const port of ports) {
    const r = await _tryPort(port, host);
    if (r) {
      return r;
    }
  }
}

export function _fmtOnHost(hostname: string | undefined) {
  return hostname ? `on host ${JSON.stringify(hostname)}` : "on any host";
}

const HOSTNAME_RE = /^(?!-)[\d.:A-Za-z-]{1,63}(?<!-)$/;

export function _validateHostname(
  hostname: string | undefined,
  _public: boolean,
  verbose: boolean,
) {
  if (hostname && !HOSTNAME_RE.test(hostname)) {
    const fallbackHost = _public ? "0.0.0.0" : "127.0.0.1";
    _log(
      verbose,
      `Invalid hostname: ${JSON.stringify(hostname)}. Using ${JSON.stringify(
        fallbackHost,
      )} as fallback.`,
    );
    return fallbackHost;
  }
  return hostname;
}
