import { createServer, Server } from 'net'

export function blockPort (port: number, host: string): Promise<Server> {
  return new Promise((resolve) => {
    const blocker = createServer()
    blocker.on('error', (err) => { throw err })
    blocker.listen(port, host, () => {
      resolve(blocker)
    })
  })
}

export async function blockPorts (ports: number[], host: string): Promise<Server[]> {
  const portBlockers: Server[] = []

  for (const port of ports) {
    const blocker = await blockPort(port, host)
    portBlockers.push(blocker)
  }

  return portBlockers
}
