import { createServer, AddressInfo } from "node:net";
import { networkInterfaces } from "node:os";
import { isSafePort } from "./unsafe-ports";

export { isUnsafePort, isSafePort } from "./unsafe-ports";

export interface GetPortOptions {
  name: string;
  random: boolean;
  port: number;
  ports: number[];
  portRange: [from: number, to: number];
  alternativePortRange: [from: number, to: number];
  host: string;
  verbose?: boolean;
}

export type GetPortInput = Partial<GetPortOptions> | number | string;

export type HostAddress = undefined | string;
export type PortNumber = number;

function log(...arguments_) {
  // eslint-disable-next-line no-console
  console.log("[get-port]", ...arguments_);
}

export async function getPort(config: GetPortInput = {}): Promise<PortNumber> {
  if (typeof config === "number" || typeof config === "string") {
    config = { port: Number.parseInt(config + "") || 0 };
  }

  const options = {
    name: "default",
    random: false,
    ports: [],
    portRange: [],
    alternativePortRange: config.port ? [] : [3000, 3100],
    host: undefined,
    verbose: false,
    ...config,
    port: config.port || Number.parseInt(process.env.PORT || "") || 3000,
  } as GetPortOptions;

  if (options.random) {
    return getRandomPort(options.host);
  }

  // Ports to check

  const portsToCheck: PortNumber[] = [
    options.port,
    ...options.ports,
    ...generateRange(...options.portRange),
  ].filter((port) => {
    if (!port) {
      return false;
    }
    if (!isSafePort(port)) {
      if (options.verbose) {
        log("Ignoring unsafe port:", port);
      }
      return false;
    }
    return true;
  });

  // Try to find a port
  let availablePort = await findPort(
    portsToCheck,
    options.host,
    options.verbose,
    false,
  );

  // Try fallback port range
  if (!availablePort) {
    availablePort = await findPort(
      generateRange(...options.alternativePortRange),
      options.host,
      options.verbose,
    );
    if (options.verbose) {
      log(
        `Unable to find an available port (tried ${
          portsToCheck.join(", ") || "-"
        }). Using alternative port:`,
        availablePort,
      );
    }
  }

  return availablePort;
}

export async function getRandomPort(host?: HostAddress) {
  const port = await checkPort(0, host);
  if (port === false) {
    throw new Error("Unable to obtain an available random port number!");
  }
  return port;
}

export interface WaitForPortOptions {
  host?: HostAddress;
  delay?: number;
  retries?: number;
}
export async function waitForPort(
  port: PortNumber,
  options: WaitForPortOptions = {},
) {
  const delay = options.delay || 500;
  const retries = options.retries || 4;
  for (let index = retries; index > 0; index--) {
    if ((await checkPort(port, options.host)) === false) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error(
    `Timeout waiting for port ${port} after ${retries} retries with ${delay}ms interval.`,
  );
}

export async function checkPort(
  port: PortNumber,
  host: HostAddress | HostAddress[] = process.env.HOST,
  _verbose?: boolean,
): Promise<PortNumber | false> {
  if (!host) {
    host = getLocalHosts([undefined /* default */, "0.0.0.0"]);
  }
  if (!Array.isArray(host)) {
    return _checkPort(port, host);
  }
  for (const _host of host) {
    const _port = await _checkPort(port, _host);
    if (_port === false) {
      if (port < 1024 && _verbose) {
        log("Unable to listen to priviliged port:", `${_host}:${port}`);
      }
      return false;
    }
    if (port === 0 && _port !== 0) {
      port = _port;
    }
  }
  return port;
}

// ----- Internal -----

function generateRange(from: number, to: number): number[] {
  if (to < from) {
    return [];
  }
  const r = [];
  for (let index = from; index < to; index++) {
    r.push(index);
  }
  return r;
}

function _checkPort(
  port: PortNumber,
  host: HostAddress,
): Promise<PortNumber | false> {
  return new Promise((resolve) => {
    const server = createServer();
    server.unref();
    server.on("error", (error: Error & { code: string }) => {
      // Ignore invalid host
      if (error.code === "EINVAL" || error.code === "EADDRNOTAVAIL") {
        resolve(port !== 0 && isSafePort(port) && port);
      } else {
        resolve(false);
      }
    });
    server.listen({ port, host }, () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => {
        resolve(isSafePort(port) && port);
      });
    });
  });
}

function getLocalHosts(additional?: HostAddress[]): HostAddress[] {
  const hosts = new Set<HostAddress>(additional);
  for (const _interface of Object.values(networkInterfaces())) {
    for (const config of _interface || []) {
      hosts.add(config.address);
    }
  }
  return [...hosts];
}

async function findPort(
  ports: number[],
  host?: HostAddress,
  _verbose = false,
  _random = true,
): Promise<PortNumber> {
  for (const port of ports) {
    const r = await checkPort(port, host, _verbose);
    if (r) {
      return r;
    }
  }
  if (_random) {
    const randomPort = await getRandomPort(host);
    if (_verbose) {
      log(
        `Unable to find an available port (tried ${
          ports.join(", ") || "-"
        }). Using random port:`,
        randomPort,
      );
    }
    return randomPort;
  } else {
    return 0;
  }
}
