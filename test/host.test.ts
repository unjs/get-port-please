import { Server } from 'net'
import { getPort } from '../src'
import { blockPort } from './utils'

let portBlocker: Server

afterEach(() => {
  portBlocker?.close()
})

describe('getPort (host)', () => {
  test('default port is NOT IN USE', async () => {
    const port = await getPort({ host: '0.0.0.0' })
    expect(port).toEqual(3000)
  })

  test('default port is IN USE', async () => {
    portBlocker = await blockPort(3000, '0.0.0.0')
    const port = await getPort({ host: '0.0.0.0' })
    expect(port).toEqual(4000)
  })

  test('called with not valid value', async () => {
    const host = 'not-valid-host'
    await expect(getPort({ host })).rejects.toThrow()
  })
})

describe('getPort (hosts)', () => {
  test('default port is NOT IN USE', async () => {
    const port = await getPort({ hosts: ['0.0.0.0'] })
    expect(port).toEqual(3000)
  })

  test('default port is IN USE', async () => {
    portBlocker = await blockPort(3000, '0.0.0.0')
    const port = await getPort({ hosts: ['0.0.0.0'] })
    expect(port).toEqual(4000)
  })

  test('called with not valid value', async () => {
    const hosts = ['0.0.0.0', 'not-valid-host']
    await expect(getPort({ hosts })).rejects.toThrow()
  })
})
