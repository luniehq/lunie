describe('LCD Connector', () => {
  let LCDConnector
  let initialNodeIP = '1.1.1.1'
  let relayServerPort = '1234'
  let lcdPort = '5678'

  function newNode () {
    return LCDConnector(initialNodeIP, relayServerPort, lcdPort)
  }

  beforeEach(() => {
    jest.resetModules()
    LCDConnector = require('renderer/node')

    jest.mock('tendermint', () => () => ({
      on (value, cb) {},
      removeAllListeners () {},
      ws: {
        destroy () {}
      }
    }))

    jest.mock('axios', (url) => jest.fn()
      .mockReturnValueOnce({data: '1.2.3.4'}))
  })

  it('should provide the nodeIP', () => {
    let node = newNode()
    expect(node.nodeIP).toBe(initialNodeIP)
    expect(node.relayPort).toBe(relayServerPort)
    expect(node.lcdPort).toBe(lcdPort)
  })

  it('should init the rpc connection on initialization', () => {
    let node = newNode()
    expect(node.rpc).toBeDefined()
    expect(node.rpcOpen).toBe(true)
  })

  it('should remember if it could not connect via rpc', () => {
    jest.mock('tendermint', () => () => ({
      on (value, cb) {
        if (value === 'error') {
          cb({code: 'ECONNREFUSED'})
        }
      }
    }))
    jest.resetModules()
    LCDConnector = require('renderer/node')
    let node = newNode()
    expect(node.rpc).toBeDefined()
    expect(node.rpcOpen).toBe(false)
  })

  it('should notify the main process to reconnect', async () => {
    let node = newNode()
    expect(node.rpcConnecting).toBe(false)
    node.initRPC = jest.fn()
    let nodeIP = await node.rpcReconnect()
    expect(nodeIP).toBe('1.2.3.4')
  })

  it('should try to reconnect until it gets a valid ip', async () => {
    jest.resetModules()
    LCDConnector = require('renderer/node')

    jest.mock('tendermint', () => () => ({
      on (value, cb) {},
      removeAllListeners () {},
      ws: {
        destroy () {}
      }
    }))

    jest.mock('axios', (url) => jest.fn()
      .mockReturnValueOnce({data: null})
      .mockReturnValueOnce({data: '1.2.3.5'}))

    let axios = require('axios')

    let node = newNode()
    node.relayPort = '1235'

    let nodeIP = await node.rpcReconnect()
    expect(axios.mock.calls.length).toBe(2)
    expect(nodeIP).toBe('1.2.3.5')
  })

  it('should show the connection state to the LCD', async () => {
    let node = newNode()
    node.listKeys = () => Promise.reject()
    expect(await node.lcdConnected()).toBe(false)
    node.listKeys = () => Promise.resolve([''])
    expect(await node.lcdConnected()).toBe(true)
  })
})
