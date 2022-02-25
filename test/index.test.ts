import { Server } from 'net'
import { describe, test, expect, afterEach } from 'vitest'
import { getPort } from '../src'
import { blockPort } from './utils'

describe('getPort ()', () => {
  describe('checks ports on default host`', () => {
    let portBlocker: Server

    afterEach(() => {
      portBlocker?.close()
    })

    test('default port is NOT IN USE', async () => {
      const port = await getPort()
      expect(port).toEqual(3000)
    })

    test('default port is in use', async () => {
      portBlocker = await blockPort(3000)
      const port = await getPort()
      expect(port).toEqual(4000)
    })
  })
})

describe('getPort (host)', () => {
  describe('checks ports on `localhost`', () => {
    let portBlocker: Server

    afterEach(() => {
      portBlocker?.close()
    })

    test('default port is NOT IN USE', async () => {
      const port = await getPort({ host: 'localhost' })
      expect(port).toEqual(3000)
    })

    test('default port is IN USE', async () => {
      portBlocker = await blockPort(3000, 'localhost')
      const port = await getPort({ host: 'localhost' })
      expect(port).toEqual(4000)
    })
  })
})

describe('getPort (host)', () => {
  let portBlocker: Server

  afterEach(() => {
    portBlocker?.close()
  })

  test('default port is in use', async () => {
    process.env.HOST = 'localhost'
    portBlocker = await blockPort(3000, 'localhost')
    const port = await getPort()
    expect(port).toEqual(4000)
  })
})
