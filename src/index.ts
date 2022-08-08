import { createServer, AddressInfo } from 'net'
import { networkInterfaces } from 'os'
import { getMemo, setMemo } from 'fs-memo'
import { isSafePort } from './unsafe-ports'

export { isUnsafePort, isSafePort } from './unsafe-ports'

export interface GetPortOptions {
  name: string
  random: boolean
  port: number
  ports: number[]
  portRange: [from: number, to: number]
  alternativePortRange: [from: number, to: number]
  host: string
  memoDir: string
  memoName: string
  verbose?: boolean
}

export type GetPortInput = Partial<GetPortOptions> | number | string

export type HostAddress = undefined | string
export type PortNumber = number

function log (...args) {
  // eslint-disable-next-line no-console
  console.log('[get-port]', ...args)
}

export async function getPort (config: GetPortInput = {}): Promise<PortNumber> {
  if (typeof config === 'number' || typeof config === 'string') {
    config = { port: parseInt(config + '') || 0 }
  }

  const options = {
    name: 'default',
    random: false,
    ports: [],
    portRange: [],
    alternativePortRange: [3000, 3100],
    host: undefined,
    memoName: 'port',
    verbose: false,
    ...config,
    port: parseInt(process.env.PORT || '') || config.port || 3000
  } as GetPortOptions

  if (options.random) {
    return getRandomPort(options.host)
  }

  // Ports to check

  const portsToCheck: PortNumber[] = [
    options.port,
    ...options.ports,
    ...generateRange(...options.portRange)
  ].filter((port) => {
    if (!port) {
      return false
    }
    if (!isSafePort(port)) {
      if (options.verbose) {
        log('Ignoring unsafe port:', port)
      }
      return false
    }
    return true
  })

  // Memo
  const memoOptions = { name: options.memoName, dir: options.memoDir! }
  const memoKey = 'port_' + options.name
  const memo = await getMemo(memoOptions)
  if (memo[memoKey]) {
    portsToCheck.push(memo[memoKey])
  }

  // Try to find a port
  let availablePort = await findPort(portsToCheck, options.host, options.verbose, false)

  // Try fallback port range
  if (!availablePort) {
    availablePort = await findPort(generateRange(...options.alternativePortRange), options.host, options.verbose)
    if (options.verbose) {
      log(`Unable to find an available port (tried ${portsToCheck.join(', ') || '-'}). Using alternative port:`, availablePort)
    }
  }

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

export interface WaitForPortOptions {
  host?: HostAddress
  delay?: number
  retries?: number
}
export async function waitForPort (port: PortNumber, opts: WaitForPortOptions = {}) {
  const delay = opts.delay || 500
  const retries = opts.retries || 4
  for (let i = retries; i > 0; i--) {
    if (await checkPort(port, opts.host) === false) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  throw new Error(`Timeout waiting for port ${port} after ${retries} retries with ${delay}ms interval.`)
}

export async function checkPort (port: PortNumber, host: HostAddress | HostAddress[] = process.env.HOST, _verbose?: boolean): Promise<PortNumber|false> {
  if (!host) {
    host = getLocalHosts([undefined /* default */, '0.0.0.0'])
  }
  if (!Array.isArray(host)) {
    return _checkPort(port, host)
  }
  for (const _host of host) {
    const _port = await _checkPort(port, _host)
    if (_port === false) {
      if (port < 1024 && _verbose) {
        log('Unable to listen to priviliged port:', `${_host}:${port}`)
      }
      return false
    }
    if (port === 0 && _port !== 0) {
      port = _port
    }
  }
  return port
}

// ----- Internal -----

function generateRange (from: number, to: number): number[] {
  if (to < from) {
    return []
  }
  const r = []
  for (let i = from; i < to; i++) {
    r.push(i)
  }
  return r
}

function _checkPort (port: PortNumber, host: HostAddress): Promise<PortNumber|false> {
  return new Promise((resolve) => {
    const server = createServer()
    server.unref()
    server.on('error', (err: Error & { code: string }) => {
      // Ignore invalid host
      if (err.code === 'EINVAL' || err.code === 'EADDRNOTAVAIL') {
        resolve(port !== 0 && isSafePort(port) && port)
      } else {
        resolve(false)
      }
    })
    server.listen({ port, host }, () => {
      const { port } = server.address() as AddressInfo
      server.close(() => { resolve(isSafePort(port) && port) })
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

async function findPort (ports: number[], host?: HostAddress, _verbose: boolean = false, _random: boolean = true): Promise<PortNumber> {
  for (const port of ports) {
    const r = await checkPort(port, host, _verbose)
    if (r) {
      return r
    }
  }
  if (_random) {
    const randomPort = await getRandomPort(host)
    if (_verbose) {
      log(`Unable to find an available port (tried ${ports.join(', ') || '-'}). Using random port:`, randomPort)
    }
    return randomPort
  } else {
    return 0
  }
}
