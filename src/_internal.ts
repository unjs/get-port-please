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

export function _generateRange(from: number, to: number): number[] {
  if (to < from) {
    return [];
  }
  const r = [];
  for (let index = from; index <= to; index++) {
    r.push(index);
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

// Addresses that can answer for `localhost`. They can each hold the same port
// independently (e.g. `::1` while another process holds `127.0.0.1`), so a
// port is only free for a loopback or wildcard host if none of them has it.
const LOOPBACK_HOSTS: HostAddress[] = ["127.0.0.1", "::1", "0.0.0.0", "::"];

function _isLoopbackHost(host: HostAddress): boolean {
  return !host || host === "localhost" || LOOPBACK_HOSTS.includes(host);
}

function _isPortInUse(port: PortNumber, host: HostAddress): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.on("error", (error: NodeJS.ErrnoException) => {
      // Other errors (e.g. `EADDRNOTAVAIL` when IPv6 is disabled) mean the
      // address does not exist here, so it cannot hold the port either.
      resolve(error.code === "EADDRINUSE" || error.code === "EACCES");
    });
    server.listen({ port, host }, () => {
      server.close(() => resolve(false));
    });
  });
}

export async function _tryPortOnLoopback(
  port: PortNumber,
  host: HostAddress,
): Promise<PortNumber | false> {
  const result = await _tryPort(port, host);
  if (result === false || !_isLoopbackHost(host)) {
    return result;
  }
  for (const loopbackHost of LOOPBACK_HOSTS) {
    if (loopbackHost !== host && (await _isPortInUse(result, loopbackHost))) {
      return false;
    }
  }
  return result;
}

export function _getLocalHosts(additional: HostAddress[]): HostAddress[] {
  const hosts = new Set<HostAddress>(additional);
  for (const _interface of Object.values(networkInterfaces())) {
    for (const config of _interface || []) {
      if (
        config.address &&
        !config.internal &&
        !config.address.startsWith("fe80::") && // Link-Local
        !config.address.startsWith("169.254") // reserved for Automatic Private IP Addressing
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
    const r = await _tryPortOnLoopback(port, host);
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
