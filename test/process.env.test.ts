import { Server } from 'net'
import { getPort } from '../src'
import { blockPort } from './utils'

let rollBackEnv: typeof process.env
let portBlocker: Server

beforeEach(() => {
  rollBackEnv = Object.assign({}, process.env)
})

afterEach(() => {
  portBlocker?.close()
  process.env = rollBackEnv
})

describe('process.env.HOST', () => {
  test('default port is NOT IN USE', async () => {
    process.env.HOST = '0.0.0.0'
    const port = await getPort()
    expect(port).toEqual(3000)
  })

  test('default port is IN USE', async () => {
    process.env.HOST = '127.0.0.1'
    portBlocker = await blockPort(3000, '127.0.0.1')

    const port = await getPort()

    expect(port).toEqual(4000)
  })

  test('called with not valid value', async () => {
    process.env.HOST = 'not-valid-host'
    await expect(getPort()).rejects.toThrow()
  })
})

describe('process.env.PORT', () => {
  test('the requested port is NOT IN USE', async () => {
    process.env.PORT = '3456'
    const port = await getPort()
    expect(port).toEqual(3456)
  })

  test('the requested port is IN USE', async () => {
    process.env.PORT = '3456'
    portBlocker = await blockPort(3456, '0.0.0.0')

    const port = await getPort()

    expect(port).toEqual(4000)
  })

  test('called with not valid value', async () => {
    process.env.PORT = 'fifty-fifty'
    const port = await getPort()
    expect(port).toEqual(3000)
  })
})
