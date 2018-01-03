const LCDConnector = require('renderer/node')

let fetch = global.fetch

describe('LCD Connector', () => {
  beforeEach(() => {
    process.env.COSMOS_UI_ONLY = 'false'
  })
  beforeAll(() => {
    global.fetch = () => Promise.resolve({
      text: () => '1.2.3.4'
    })
  })
  afterAll(() => {
    global.fetch = fetch
  })

  it('should return a mockClient if setting COSMOS_UI_ONLY', () => {
    process.env.COSMOS_UI_ONLY = 'true'
    let node = LCDConnector('1.1.1.1')
    expect(node.generateKey().key.address).toBe('UI_ONLY_MODE')
  })

  it('should init the rpc connection on initialization', () => {
    let node = LCDConnector('1.1.1.1')
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
    let LCDConnector = require('renderer/node')
    let node = LCDConnector('1.1.1.1')
    expect(node.rpc).toBeDefined()
    expect(node.rpcOpen).toBe(false)
  })

  it('should notify the main process to reconnect', async () => {
    let node = LCDConnector('1.1.1.1')
    expect(node.rpcConnecting).toBe(false)
    node.initRPC = jest.fn()
    let nodeIP = await node.rpcReconnect()
    expect(nodeIP).toBe('1.2.3.4')
  })

  it('should try to reconnect until it gets a valid ip', async () => {
    let node = LCDConnector('1.1.1.1')
    let i = 0
    global.fetch = jest.fn(() => {
      return Promise.resolve({
        text: () => {
          if (i++ === 0) {
            return null
          } else {
            return '1.2.3.4'
          }
        }
      })
    })
    let nodeIP = await node.rpcReconnect()
    expect(global.fetch.mock.calls.length).toBe(2)
    expect(nodeIP).toBe('1.2.3.4')
  })

  it('should return if it is connected to the LCD', async () => {
    let node = LCDConnector('1.1.1.1')
    expect(await node.lcdConnected()).toBe(false)
    node.listKeys = () => Promise.resolve([''])
    expect(await node.lcdConnected()).toBe(true)
  })
})
