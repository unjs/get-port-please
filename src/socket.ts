import { tmpdir } from "node:os";
import { join } from "node:path";
import { Server } from "node:net";

export interface GetSocketOptions {
  /* Human readable prefix for the socket name */
  name: string;

  /**
   * Use process ID in the socket name.
   */
  pid?: boolean;

  /**
   * Use a random number in the socket name.
   *
   */
  random?: boolean;
}

let _nodeMajorVersion: number | undefined;
let _isSocketSupported: boolean | undefined;

/**
 * Generates a socket address based on the provided options.
 */
export function getSocketAddress(opts: GetSocketOptions): string {
  const parts = [
    opts.name,
    opts.pid ? process.pid : undefined,
    opts.random ? Math.round(Math.random() * 10_000) : undefined,
  ].filter(Boolean);

  const socketName = `${parts.join("-")}.sock`;

  // Windows: pipe
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }

  // Linux: abstract namespace
  // Fallback to a regular file socket on older Node.js versions to avoid issues
  if (process.platform === "linux") {
    if (_nodeMajorVersion === undefined) {
      _nodeMajorVersion = +process.versions.node.split(".")[0];
    }
    if (_nodeMajorVersion >= 20) {
      return `\0${socketName}`;
    }
  }

  // Unix socket
  return join(tmpdir(), socketName);
}

/**
 * Test if the current environment supports sockets.
 */
export async function isSocketSupported(): Promise<boolean> {
  if (_isSocketSupported !== undefined) {
    return _isSocketSupported;
  }
  if (globalThis.process?.versions?.webcontainer) {
    // Seems broken: https://stackblitz.com/edit/stackblitz-starters-1y68uhvu
    return false;
  }

  const socketAddress = getSocketAddress({ name: "get-port", random: true });
  const server = new Server();
  try {
    await new Promise<void>((resolve, reject) => {
      server.on("error", reject);
      server.listen(socketAddress, resolve);
    });
    _isSocketSupported = true;
    return true;
  } catch {
    _isSocketSupported = false;
    return false;
  } finally {
    if (server.listening) {
      server.close();
    }
  }
}
