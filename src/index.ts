import { createServer } from 'net'
import { getMemo, setMemo } from 'fs-memo'

export interface GetPortOptions {
  name: string
  random: boolean
  port: number
  ports: number[]
  host: string
  hosts: string[]
  memoDir: string
  memoName: string
}

export type GetPortInput = Partial<GetPortOptions> | number | string

export async function getPort (config?: GetPortInput): Promise<number> {
  if (typeof config === 'number' || typeof config === 'string') {
    config = { port: parseInt(config + '') }
  }

  const options = {
    name: 'default',
    random: false,
    port: parseInt(process.env.PORT || '') || 3000,
    ports: [4000, 5000, 6000, 7000],
    host: process.env.HOST,
    hosts: ['0.0.0.0', '127.0.0.1'],
    memoName: 'port',
    ...config
  } as GetPortOptions

  const portsToCheck: number[] = []

  if (!options.random) {
    // options.port
    if (options.port) {
      portsToCheck.push(options.port)
    }

    // options.ports
    if (Array.isArray(options.ports)) {
      portsToCheck.push(...options.ports)
    }
  }

  const hostsToCheck = options.host ? [options.host] : options.hosts

  // Memo
  const memoOptions = { name: options.memoName, dir: options.memoDir! }

  const memoKey = 'port_' + options.name
  const memo = await getMemo(memoOptions)
  if (memo[memoKey]) {
    portsToCheck.push(memo[memoKey])
  }

  const resolvedPort = await resolvePort(portsToCheck, hostsToCheck)

  // Persist
  await setMemo({ [memoKey]: resolvedPort }, memoOptions)

  return resolvedPort
}

async function resolvePort (ports: number[], hosts: string[]): Promise<number> {
  let availablePort: number = NaN
  let i = 0

  do {
    const isRandomPort = i === ports.length
    const port = !isRandomPort ? ports[i++] : getRandomPort()
    if (await checkHosts(port, hosts)) {
      availablePort = port
    }
  } while (!availablePort)

  return availablePort
}

function getRandomPort (min = 1024, max = 65535) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function checkHosts (port: number, hosts: string[]): Promise<boolean> {
  try {
    for (const host of hosts) {
      await checkPort(port, host)
    }
  } catch (err) {
    handleError(err)
    return false
  }

  return true
}

function checkPort (port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    server.unref()
    server.on('error', err => reject(err))
    server.listen(port, host, () => {
      server.close(() => { resolve() })
    })
  })
}

function handleError (err: any) {
  const silenced = ['EADDRINUSE', 'EACCES'] // expected, must be silenced
  if (!silenced.includes(err.code)) {
    throw err
  }
}
