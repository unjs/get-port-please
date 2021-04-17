import { Server } from 'net'
import { getPort } from '../src'
import { blockPort, blockPorts } from './utils'

let portBlocker: Server
let portBlockers: Server[]

afterEach(() => {
  portBlocker?.close()
  portBlockers?.forEach((blocker) => {
    blocker.close()
  })
})

describe('getPort ()', () => {
  test('default port is NOT IN USE', async () => {
    const port = await getPort()
    expect(port).toEqual(3000)
  })

  test('default port is IN USE', async () => {
    portBlocker = await blockPort(3000, '0.0.0.0')
    const port = await getPort()
    expect(port).toEqual(4000)
  })

  test('some of default ports are IN USE', async () => {
    const defaultPorts = [3000, 4000, 5000, 7000]
    portBlockers = await blockPorts(defaultPorts, '0.0.0.0')

    const port = await getPort()

    expect(port).toEqual(6000)
  })

  test('all default ports are IN USE', async () => {
    const defaultPorts = [3000, 4000, 5000, 6000, 7000]
    portBlockers = await blockPorts(defaultPorts, '0.0.0.0')

    const port = await getPort()

    expect(port).toBeGreaterThanOrEqual(1024)
    expect(port).toBeLessThanOrEqual(65535)
    expect(defaultPorts).not.toContain(port)
  })

  test('requested port is NOT IN USE', async () => {
    const port = await getPort(3456)
    expect(port).toEqual(3456)
  })

  test('requested port is IN USE', async () => {
    portBlocker = await blockPort(3456, '0.0.0.0')
    const port = await getPort(3456)
    expect(port).toEqual(4000)
  })

  test('called with a number', async () => {
    const port = await getPort('5050')
    expect(port).toEqual(5050)
  })

  test('called with a string parsable to a number', async () => {
    const port = await getPort('5050')
    expect(port).toEqual(5050)
  })

  test('called with a string NOT parsable to a number', async () => {
    const port = await getPort('fifty-fifty')
    expect(port).toEqual(4000)
  })

  test.skip('the requested port is privileged', async () => { // for MacOS only
    const port = await getPort(1010)
    expect(port).toEqual(4000)
  })
})
