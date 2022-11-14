import { createServer, Server } from "node:net";

export function blockPort (port: number, host = "0.0.0.0"): Promise<Server> {
  return new Promise((resolve) => {
    const blocker = createServer();
    blocker.listen(port, host, () => {
      resolve(blocker);
    });
  });
}

export async function blockPorts (ports: number[], host = "0.0.0.0"): Promise<Server[]> {
  const portBlockers: Server[] = [];

  for (const port of ports) {
    const blocker = await blockPort(port, host);
    portBlockers.push(blocker);
  }

  return portBlockers;
}
