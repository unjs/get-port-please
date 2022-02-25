import { createServer, AddressInfo } from 'net'
import { networkInterfaces } from 'os'
import { getMemo, setMemo } from 'fs-memo'

export interface GetPortOptions {
  name: string
  random: boolean
  port: number
  ports: number[]
  host: string
  memoDir: string
  memoName: string
}

export type GetPortInput = Partial<GetPortOptions> | number | string

export type HostAddress = undefined | string
export type PortNumber = number

export async function getPort (config?: GetPortInput): Promise<PortNumber> {
  if (typeof config === 'number' || typeof config === 'string') {
    config = { port: parseInt(config + '') }
  }

  const options = {
    name: 'default',
    random: false,
    port: parseInt(process.env.PORT || '') || 3000,
    ports: [4000, 5000, 6000, 7000],
    host: undefined,
    memoName: 'port',
    ...config
  } as GetPortOptions

  if (options.random) {
    return getRandomPort(options.host)
  }

  // Ports to check
  const portsToCheck: PortNumber[] = [
    options.port,
    ...options.ports
  ].filter(Boolean)

  // Memo
  const memoOptions = { name: options.memoName, dir: options.memoDir! }
  const memoKey = 'port_' + options.name
  const memo = await getMemo(memoOptions)
  if (memo[memoKey]) {
    portsToCheck.push(memo[memoKey])
  }

  // Try to find a port
  const availablePort = await findPort(portsToCheck, options.host)

  // Persist
  await setMemo({ [memoKey]: availablePort }, memoOptions)

  return availablePort
}

export async function getRandomPort (host?: HostAddress) {
  const port = await checkPort(0, host)
  if (port === false) {
    throw new Error('Unable to obtain an available random port number!')
  }
  return port
}

export async function checkPort (port: PortNumber, host: HostAddress | HostAddress[] = process.env.HOST): Promise<PortNumber|false> {
  if (!host) {
    host = getLocalHosts([undefined /* default */, '0.0.0.0'])
  }
  if (!Array.isArray(host)) {
    return _checkPort(port, host)
  }
  for (const _host of host) {
    const _port = await _checkPort(port, _host)
    if (_port === false) {
      return false
    }
    if (port === 0 && _port !== 0) {
      port = _port
    }
  }
  return port
}

export interface WaitForPortOptions {
  host?: HostAddress
  delay?: number
  retries?: number
}
export async function waitForPort (port: PortNumber, opts: WaitForPortOptions = {}) {
  const delay = opts.delay || 500
  const retries = opts.retries || 4
  for (let i = retries; i > 0; i--) {
    if (await _checkPort(port, opts.host) === false) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  throw new Error(`Timeout waiting for port ${port} after ${retries} retries with ${delay}ms interval.`)
}

// ----- Internal -----

function _checkPort (port: PortNumber, host: HostAddress): Promise<PortNumber|false> {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.on('error', (err: Error & { code: string }) => {
      // Ignore invalid host
      if (err.code === 'EINVAL' || err.code === 'EADDRNOTAVAIL') {
        resolve(port !== 0 ? port : false)
      } else {
        resolve(false)
      }
    })
    server.listen({ port, host }, () => {
      const { port } = server.address() as AddressInfo
      server.close(() => { resolve(port) })
    })
  })
}

function getLocalHosts (additional?: HostAddress[]): HostAddress[] {
  const hosts = new Set<HostAddress>(additional)
  for (const _interface of Object.values(networkInterfaces())) {
    for (const config of _interface!) {
      hosts.add(config.address)
    }
  }
  return Array.from(hosts)
}

async function findPort (ports: number[], host?: HostAddress): Promise<PortNumber> {
  for (const port of ports) {
    const r = await checkPort(port, host)
    if (r) {
      return r
    }
  }
  return getRandomPort(host)
}
