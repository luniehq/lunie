describe(`RPC Connector`, () => {
  let connector = {}

  function newConnector() {
    jest.resetModules()
    const RpcWrapper = require(`src/connectors/rpcWrapper`).default

    connector = {}
    const newRpcClient = RpcWrapper(connector)

    Object.assign(connector, newRpcClient)
  }

  beforeEach(() => {
    jest.mock(`src/connectors/tendermint-ws.js`, () => () => ({
      on() {},
      removeAllListeners() {},
      ws: { destroy() {} },
      health: () => ({})
    }))

    newConnector()
  })

  it(`should init the rpc connection`, async () => {
    await connector.rpcConnect(`localhost`)
    expect(connector.rpc).toBeDefined()
    expect(connector.rpcInfo.connected).toBe(true)
  })

  it(`should remember if it could not connect via rpc`, async () => {
    jest.mock(`src/connectors/tendermint-ws.js`, () => () => ({
      on(value, cb) {
        if (value === `error`) {
          cb({ code: `ECONNREFUSED` })
        }
      },
      health: () => ({})
    }))
    newConnector()
    await expect(connector.rpcConnect(`localhost`)).rejects.toThrow()
    expect(connector.rpc).not.toBeDefined()
    expect(connector.rpcInfo.connected).toBe(false)
  })

  it(`should cleanup the old websocket when connecting again`, async () => {
    await connector.rpcConnect(`localhost`)

    const spyListeners = jest.spyOn(connector.rpc, `removeAllListeners`)
    const spyDestroy = jest.spyOn(connector.rpc.ws, `destroy`)

    await connector.rpcConnect(`localhost`)

    expect(spyListeners).toHaveBeenCalledWith(`error`)
    expect(spyDestroy).toHaveBeenCalled()
    expect(connector.rpcInfo.connected).toBe(true)
  })

  it(`should disconnect`, async () => {
    await connector.rpcConnect(`localhost`)

    const spyListeners = jest.spyOn(connector.rpc, `removeAllListeners`)
    const spyDestroy = jest.spyOn(connector.rpc.ws, `destroy`)

    await connector.rpcDisconnect()

    expect(spyListeners).toHaveBeenCalledWith(`error`)
    expect(spyDestroy).toHaveBeenCalled()
    expect(connector.rpcInfo.connected).toBe(false)
  })
})
