import { Server } from 'net'
import { blockPort } from './utils'

describe('getPort (host)', () => {
  const ENV = process.env
  let portBlocker: Server

  beforeEach(() => {
    jest.resetModules()
    process.env = ENV
  })

  afterEach(() => {
    process.env = ENV
    portBlocker?.close()
  })

  test('default port is not use', async () => {
    const { getPort } = await import('../src')
    const port = await getPort()
    expect(port).toEqual(3000)
  })

  test('default port is in use', async () => {
    process.env.HOST = 'localhost'
    const { getPort } = await import('../src')
    portBlocker = await blockPort(3000, 'localhost')
    const port = await getPort()
    expect(port).toEqual(4000)
  })
})
