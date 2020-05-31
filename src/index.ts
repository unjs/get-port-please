import { createServer, AddressInfo } from 'net'
import { getMemo, setMemo } from 'fs-memo'

const defaults = {
  ports: [4000, 5000, 6000, 7000],
  port: parseInt(process.env.PORT || '') || 3000,
  memoDir: __dirname,
  memoName: '.get-port'
}

type GetPortOptions = Partial<typeof defaults>

export default async function getPort (_options: GetPortOptions = {}): Promise<number> {
  const options = { ...defaults, _options }

  const portsToCheck: number[] = []

  // options.port
  if (options.port) {
    portsToCheck.push(options.port)
  }

  // options.ports
  if (Array.isArray(options.ports)) {
    portsToCheck.push(...options.ports)
  }

  // Memo
  const memoOptions = { name: options.memoName, dir: options.memoDir }
  const memo = await getMemo(memoOptions)
  if (memo.port) {
    portsToCheck.push(memo.port)
  }

  const port = await checkPorts(portsToCheck)

  // Persist
  await setMemo({ port }, memoOptions)

  return port
}

async function checkPorts (ports: number[]): Promise<number> {
  for (const p of ports) {
    const r = await checkPort(p)
    if (r) {
      return r
    }
  }
  return checkPort(0) as unknown as number
}

function checkPort (port: number): Promise<number|false> {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.on('error', () => { resolve(false) })
    server.listen({ port }, () => {
      const { port } = server.address() as AddressInfo
      server.close(() => { resolve(port) })
    })
  })
}
