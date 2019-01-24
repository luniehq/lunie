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
    jest.mock(`tendermint`, () => ({
      RpcClient: () => ({
        on() {},
        removeAllListeners() {},
        ws: { destroy() {} },
        health: () => ({})
      })
    }))

    newConnector()
  })

  it(`should init the rpc connection`, async () => {
    await connector.rpcConnect(`localhost`)
    expect(connector.rpc).toBeDefined()
    expect(connector.rpcInfo.connected).toBe(true)
  })

  it(`should remember if it could not connect via rpc`, async () => {
    jest.mock(`tendermint`, () => ({
      RpcClient: () => ({
        on(value, cb) {
          if (value === `error`) {
            cb({ code: `ECONNREFUSED` })
          }
        },
        health: () => ({})
      })
    }))
    newConnector()
    await expect(connector.rpcConnect(`localhost`)).rejects.toThrow()
    expect(connector.rpc).not.toBeDefined()
    expect(connector.rpcInfo.connected).toBe(false)
  })

  it(`should cleanup the old websocket when connecting again`, async () => {
    await connector.rpcConnect(`localhost`)

    let spyListeners = jest.spyOn(connector.rpc, `removeAllListeners`)
    let spyDestroy = jest.spyOn(connector.rpc.ws, `destroy`)

    await connector.rpcConnect(`localhost`)

    expect(spyListeners).toHaveBeenCalledWith(`error`)
    expect(spyDestroy).toHaveBeenCalled()
  })
})
