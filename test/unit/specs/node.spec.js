describe('LCD Connector', () => {
  let LCDConnector
  let initialNodeIP = '1.1.1.1'
  let relayServerPort = '1234'

  function newNode () {
    return LCDConnector(initialNodeIP, relayServerPort, false)
  }

  beforeEach(() => {
    jest.resetModules()
    LCDConnector = require('renderer/connectors/node')

    jest.mock('tendermint', () => () => ({
      on (value, cb) { },
      removeAllListeners () { },
      ws: { destroy () { } }
    }))
    jest.mock('electron', () => ({ ipcRenderer: { send: () => jest.fn() } }))
  })

  it('should provide the nodeIP', () => {
    let node = newNode()
    expect(node.rpcInfo.nodeIP).toBe(initialNodeIP)
    expect(node.relayPort).toBe(relayServerPort)
  })

  it('should init the rpc connection on initialization', () => {
    let node = newNode()
    node.rpcConnect('localhost')
    expect(node.rpc).toBeDefined()
    expect(node.rpcInfo.connected).toBe(true)
  })

  it('should remember if it could not connect via rpc', () => {
    jest.mock('tendermint', () => () => ({
      on (value, cb) {
        if (value === 'error') {
          cb({ code: 'ECONNREFUSED' })
        }
      }
    }))
    jest.resetModules()
    LCDConnector = require('renderer/connectors/node')
    let node = newNode()
    node.rpcConnect('localhost')
    expect(node.rpc).toBeDefined()
    expect(node.rpcInfo.connected).toBe(false)
  })

  it('should not react to error codes not meaning connection failed', () => {
    jest.mock('tendermint', () => () => ({
      on (value, cb) {
        if (value === 'error') {
          cb({ code: 'ABCD' })
        }
      }
    }))
    jest.resetModules()
    LCDConnector = require('renderer/connectors/node')
    let node = newNode()
    node.rpcConnect('localhost')
    expect(node.rpc).toBeDefined()
    expect(node.rpcInfo.connected).toBe(true)
  })

  it('should notify the main process to reconnect', async () => {
    let node = newNode()
    expect(node.rpcInfo.connecting).toBe(false)
    node.initRPC = jest.fn()
    let nodeIP = await node.rpcReconnect()
    expect(nodeIP).toBe('1.2.3.4')
  })

  it('should cleanup the old websocket when connecting again', () => {
    let node = newNode()
    node.rpcConnect('localhost')

    let spyListeners = jest.spyOn(node.rpc, 'removeAllListeners')
    let spyDestroy = jest.spyOn(node.rpc.ws, 'destroy')

    node.rpcConnect('localhost')

    expect(spyListeners).toHaveBeenCalledWith('error')
    expect(spyDestroy).toHaveBeenCalled()
  })

  describe('reconnect', () => {
    let node

    beforeEach(() => {
      jest.resetModules()
      LCDConnector = require('renderer/connectors/node')

      jest.mock('tendermint', () => () => ({
        on (value, cb) { },
        removeAllListeners () { },
        ws: { destroy () { } }
      }))

      jest.mock('axios', (url) => jest.fn()
        .mockReturnValueOnce({ data: null })
        .mockReturnValueOnce({ data: '1.2.3.5' }))

      node = newNode()
    })

    it('should signal a reconnect intent to the main thread', async () => {
      const { ipcRenderer } = require('electron')
      ipcRenderer.send = jest.fn()
      node.rpcReconnect()
      expect(ipcRenderer.send).toHaveBeenCalledWith('reconnect')
    })

    it('should not reconnect again if already reconnecting', async () => {
      const { ipcRenderer } = require('electron')
      ipcRenderer.send = jest.fn()
      node.rpcReconnect()
      node.rpcReconnect()
      expect(ipcRenderer.send.mock.calls.length).toBe(1)
    })
  })

  it('should show the connection state to the LCD', async () => {
    let node = newNode()
    node.listKeys = () => Promise.reject()
    expect(await node.lcdConnected()).toBe(false)
    node.listKeys = () => Promise.resolve([''])
    expect(await node.lcdConnected()).toBe(true)
  })
})
