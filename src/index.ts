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
    ports: [4000, 5000, 7000, 8000],
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
  ].filter(port => port && isSafePort(port))

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

// ----- Internal -----

// https://dheeruthedeployer.medium.com/unsafe-ports-considered-by-chrome-6f447b7e4714
const unsafePorts = [
  1, // tcpmux
  7, // echo
  9, // discard
  11, // systat
  13, // daytime
  15, // netstat
  17, // qotd
  19, // chargen
  20, // ftp data
  21, // ftp access
  22, // ssh
  23, // telnet
  25, // smtp
  37, // time
  42, // name
  43, // nicname
  53, // domain
  69, // tftp
  77, // priv-rjs
  79, // finger
  87, // ttylink
  95, // supdup
  101, // hostriame
  102, // iso-tsap
  103, // gppitnp
  104, // acr-nema
  109, // pop2
  110, // pop3
  111, // sunrpc
  113, // auth
  115, // sftp
  117, // uucp-path
  119, // nntp
  123, // NTP
  135, // loc-srv /epmap
  137, // netbios
  139, // netbios
  143, // imap2
  161, // snmp
  179, // BGP
  389, // ldap
  427, // SLP (Also used by Apple Filing Protocol)
  465, // smtp+ssl
  512, // print / exec
  513, // login
  514, // shell
  515, // printer
  526, // tempo
  530, // courier
  531, // chat
  532, // netnews
  540, // uucp
  548, // AFP (Apple Filing Protocol)
  554, // rtsp
  556, // remotefs
  563, // nntp+ssl
  587, // smtp (rfc6409)
  601, // syslog-conn (rfc3195)
  636, // ldap+ssl
  993, // ldap+ssl
  995, // pop3+ssl
  1719, // h323gatestat
  1720, // h323hostcall
  1723, // pptp
  2049, // nfs
  3659, // apple-sasl / PasswordServer
  4045, // lockd
  5060, // sip
  5061, // sips
  6000, // X11
  6566, // sane-port
  6665, // Alternate IRC [Apple addition]
  6666, // Alternate IRC [Apple addition]
  6667, // Standard IRC [Apple addition]
  6668, // Alternate IRC [Apple addition]
  6669, // Alternate IRC [Apple addition]
  6697, // IRC + TLS
  10080 // Amanda
]

const isSafePort = (port: number) => !unsafePorts.includes(port)

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

async function findPort (ports: number[], host?: HostAddress): Promise<PortNumber> {
  for (const port of ports) {
    const r = await checkPort(port, host)
    if (r) {
      return r
    }
  }
  return getRandomPort(host)
}
