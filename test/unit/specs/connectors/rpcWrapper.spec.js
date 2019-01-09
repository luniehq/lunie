describe(`RPC Connector`, () => {
  let connector = {}

  function newConnector() {
    jest.resetModules()
    const RpcWrapper = require(`renderer/connectors/rpcWrapper`)

    connector = {}
    let newRpcClient = RpcWrapper(connector)

    Object.assign(connector, newRpcClient)
  }

  beforeEach(() => {
    jest.mock(`tendermint`, () => () => ({
      on() {},
      removeAllListeners() {},
      ws: { destroy() {} }
    }))
    jest.mock(`electron`, () => ({ ipcRenderer: { send: () => jest.fn() } }))

    newConnector()
  })

  it(`should init the rpc connection`, () => {
    connector.rpcConnect(`localhost`)
    expect(connector.rpc).toBeDefined()
    expect(connector.rpcInfo.connected).toBe(true)
  })

  it(`should remember if it could not connect via rpc`, () => {
    jest.mock(`tendermint`, () => () => ({
      on(value, cb) {
        if (value === `error`) {
          cb({ code: `ECONNREFUSED` })
        }
      }
    }))
    newConnector()
    connector.rpcConnect(`localhost`)
    expect(connector.rpc).toBeDefined()
    expect(connector.rpcInfo.connected).toBe(false)
  })

  it(`should not react to error codes not meaning connection failed`, () => {
    jest.mock(`tendermint`, () => () => ({
      on(value, cb) {
        if (value === `error`) {
          cb({ code: `ABCD` })
        }
      }
    }))
    connector.rpcConnect(`localhost`)
    expect(connector.rpc).toBeDefined()
    expect(connector.rpcInfo.connected).toBe(true)
  })

  it(`should cleanup the old websocket when connecting again`, () => {
    connector.rpcConnect(`localhost`)

    let spyListeners = jest.spyOn(connector.rpc, `removeAllListeners`)
    let spyDestroy = jest.spyOn(connector.rpc.ws, `destroy`)

    connector.rpcConnect(`localhost`)

    expect(spyListeners).toHaveBeenCalledWith(`error`)
    expect(spyDestroy).toHaveBeenCalled()
  })
})
