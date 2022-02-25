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

export async function getPort (config?: GetPortInput): Promise<number> {
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

  // Memo
  const memoOptions = { name: options.memoName, dir: options.memoDir! }

  const memoKey = 'port_' + options.name
  const memo = await getMemo(memoOptions)
  if (memo[memoKey]) {
    portsToCheck.push(memo[memoKey])
  }

  const availablePort = await checkPorts(portsToCheck, options.host)

  // Persist
  await setMemo({ [memoKey]: availablePort }, memoOptions)

  return availablePort
}

export async function checkPorts (ports: number[], host?: string): Promise<number> {
  for (const port of ports) {
    const r = await checkPort(port, host)
    if (r) {
      return r
    }
  }
  return checkPort(0, host) as unknown as number
}

export type HostAddress = undefined | string

export async function checkPort (port: number, host: HostAddress | HostAddress[] | undefined = process.env.HOST): Promise<number|false> {
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

// ----- Internal -----

function _checkPort (port: number, host: HostAddress): Promise<number|false> {
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
