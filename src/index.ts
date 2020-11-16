import { createServer, AddressInfo } from 'net'
import { getMemo, setMemo } from 'fs-memo'

interface GetPortOptions {
  name?: string

  random?: boolean
  port?: number
  ports?: number[]

  memoDir?: string
  memoName?: string
}

const defaults = {
  name: 'default',

  random: false,
  port: parseInt(process.env.PORT || '') || 3000,
  ports: [4000, 5000, 6000, 7000],

  memoDir: undefined, // Default is node_modules/.cache/fs-memo
  memoName: 'port'
}

export default async function getPort (options?: GetPortOptions): Promise<number> {
  const opts = { ...defaults, ...options }

  const portsToCheck: number[] = []

  if (!opts.random) {
    // options.port
    if (opts.port) {
      portsToCheck.push(opts.port)
    }

    // options.ports
    if (Array.isArray(opts.ports)) {
      portsToCheck.push(...opts.ports)
    }
  }

  // Memo
  const memoOptions = { name: opts.memoName, dir: opts.memoDir }
  const memoKey = 'port_' + opts.name
  const memo = await getMemo(memoOptions)
  if (memo[memoKey]) {
    portsToCheck.push(memo[memoKey])
  }

  const availablePort = await checkPorts(portsToCheck)

  // Persist
  await setMemo({ [memoKey]: availablePort }, memoOptions)

  return availablePort
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
