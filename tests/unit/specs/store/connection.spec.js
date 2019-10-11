import connectionModule from "src/vuex/modules/connection.js"

jest.mock(`src/../config.js`, () => ({
  stargate: `https://voyager.lol`,
  rpc: `https://voyager-rpc.lol`
}))

describe(`Module: Connection`, () => {
  let module, state, actions, mutations, node

  beforeEach(() => {
    node = {
      tendermint: {
        status: jest.fn(() =>
          Promise.resolve({
            sync_info: {},
            node_info: {}
          })
        ),
        health: jest.fn(),
        subscribe: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
        isConnected: () => true
      }
    }
    module = connectionModule({
      node
    })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`sets the header`, () => {
      const dispatch = jest.fn()
      actions.setLastHeader(
        {
          state,
          rootState: { session: { signedIn: true } },
          dispatch
        },
        {
          height: 5,
          chain_id: `test-chain`
        }
      )
      expect(state.lastHeader.height).toBe(5)
      expect(state.lastHeader.chain_id).toBe(`test-chain`)
    })

    it(`sets nodeUrl from config.json`, () => {
      expect(state.nodeUrl).toBe(`https://voyager.lol`)
    })

    it(`sets connection state`, () => {
      expect(state.connected).toBe(false)
      mutations.setConnected(state, true)
      expect(state.connected).toBe(true)
    })

    it(`sets the rpc url`, () => {
      expect(state.rpcUrl).toBe(`https://voyager-rpc.lol`) // received from config
      mutations.setRpcUrl(state, `https://big.lol`)
      expect(state.rpcUrl).toBe(`https://big.lol`)
    })

    it(`increaseConnectionAttempts`, () => {
      mutations.increaseConnectionAttempts(state)
      expect(state.connectionAttempts).toBe(1)
    })

    it(`resetConnectionAttempts`, () => {
      state.connectionAttempts = 10
      mutations.resetConnectionAttempts(state)
      expect(state.connectionAttempts).toBe(0)
    })

    it(`setNetworkId`, () => {
      state.network = ""
      mutations.setNetworkId(state, "awesomenet")
      expect(state.network).toBe("awesomenet")
    })
  })

  it(`reconnects`, () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.reconnect({ commit, dispatch })
    expect(commit).toHaveBeenCalledWith("resetConnectionAttempts")
    expect(commit).toHaveBeenCalledWith("stopConnecting", false)
    expect(dispatch).toHaveBeenCalledWith("connect")
  })

  it(`triggers a connection`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.connect({
      state,
      commit,
      dispatch
    })

    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(node.tendermint.connect).toHaveBeenCalled()

    // on success should trigger connection follow up events
    expect(dispatch).toHaveBeenCalledWith(`reconnected`)
    expect(dispatch).toHaveBeenCalledWith(`rpcSubscribe`)
    expect(dispatch).toHaveBeenCalledWith(`subscribeToBlocks`)
  })

  it(`should not connect if stop reconnecting is set`, async () => {
    const commit = jest.fn()
    await actions.connect({
      state: Object.assign({}, state, {
        stopConnecting: true
      }),
      commit
    })

    expect(commit).not.toHaveBeenCalledWith(`setConnected`, false)
    expect(node.tendermint.connect).not.toHaveBeenCalled()
  })

  it(`should try to connect if an attempt failed`, async () => {
    jest.useFakeTimers()

    const commit = jest.fn()
    const dispatch = jest.fn()
    node.tendermint.connect = () => Promise.reject("Expected")
    await actions.connect({
      state,
      commit,
      dispatch
    })

    jest.runAllTimers()

    expect(commit).not.toHaveBeenCalledWith(`setConnected`, true)
    expect(commit).toHaveBeenCalledWith(`increaseConnectionAttempts`)
    expect(dispatch).toHaveBeenCalledWith(`connect`)
  })

  it(`should stop connecting after some attempts`, () => {
    const commit = jest.fn()
    actions.connect({
      state: Object.assign({}, state, {
        connectionAttempts: 10
      }),
      commit
    })

    expect(commit).toHaveBeenCalledWith(`stopConnecting`)
    expect(node.tendermint.connect).not.toHaveBeenCalled()
  })

  it(`reacts to rpc disconnection with reconnect`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.connect({
      state,
      commit,
      dispatch
    })
    node.tendermint.ondisconnect()

    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(dispatch).toHaveBeenCalledWith(`connect`)
  })

  it(`should not reconnect on errors that do not mean disconnection`, () => {
    node.tendermint.on = jest.fn((value, cb) => {
      cb({
        message: `some message`
      })
    })
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.rpcSubscribe({
      rootState: { session: { signedIn: true } },
      commit,
      dispatch
    })

    expect(commit).not.toHaveBeenCalledWith(`setConnected`, false)
    expect(dispatch).not.toHaveBeenCalledWith(`connect`)
  })

  it(`should set the initial status on subscription`, async () => {
    node.tendermint.status = () =>
      Promise.resolve({
        sync_info: {
          latest_block_height: 42
        },
        node_info: {
          network: `test-net`
        }
      })
    const dispatch = jest.fn()
    await actions.rpcSubscribe({
      rootState: { session: { signedIn: true } },
      commit: jest.fn(),
      dispatch
    })

    expect(dispatch).toHaveBeenCalledWith(`setLastHeader`, {
      height: 42,
      chain_id: `test-net`
    })
  })

  it(`should set insecure mode on testnet`, async () => {
    node.tendermint.status = () =>
      Promise.resolve({
        sync_info: {
          latest_block_height: 42
        },
        node_info: {
          network: `testnet`
        }
      })
    const commit = jest.fn()
    await actions.rpcSubscribe({
      rootState: { session: { signedIn: true } },
      commit,
      dispatch: jest.fn()
    })

    expect(commit).toHaveBeenCalledWith(`setInsecureMode`)
  })

  it(`should react to status updates`, async () => {
    node.tendermint.subscribe = (type, cb) => {
      if (type.query === `tm.event = 'NewBlockHeader'`) {
        cb({
          header: {
            height: 43,
            chain_id: `test-net2`,
            validators_hash: `abcd`
          }
        })
      }
    }
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.rpcSubscribe({
      rootState: { session: { signedIn: true } },
      commit,
      dispatch
    })

    expect(dispatch).toHaveBeenCalledWith(`setLastHeader`, {
      height: 43,
      chain_id: `test-net2`,
      validators_hash: `abcd`
    })
  })

  it(`should not subscribe if stopConnecting active`, () => {
    state.stopConnecting = true
    actions.rpcSubscribe({
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(node.tendermint.subscribe).not.toHaveBeenCalled()
  })

  it(`should check if the node has positively halted`, async () => {
    jest.useFakeTimers()
    const dispatch = jest.fn()
    actions.checkNodeHalted(
      {
        state,
        dispatch
      },
      100000
    )
    expect(state.nodeHaltedTimeout).toBeDefined()
    // expire the halted check before a block was received
    jest.runAllTimers()
    expect(dispatch).toHaveBeenCalledWith(`nodeHasHalted`)
  })

  it(`should check if the node has negatively halted`, async () => {
    jest.useFakeTimers()
    const dispatch = jest.fn()
    actions.checkNodeHalted(
      {
        state,
        dispatch
      },
      100000
    )
    state.lastHeader.height = 10
    // expire the halted check before a block was received
    jest.runAllTimers()
    expect(dispatch).not.toHaveBeenCalledWith(`nodeHasHalted`)
  })

  it("should switch networks", async () => {
    const dispatch = jest.fn()
    const commit = jest.fn()
    await actions.setNetwork(
      { commit, dispatch },
      {
        id: "awesomenet",
        rpc_url: "https://localhost:1337"
      }
    )
    expect(commit).toHaveBeenCalledWith("setNetworkId", "awesomenet")
    expect(commit).toHaveBeenCalledWith("setRpcUrl", "https://localhost:1337")
    expect(dispatch).toHaveBeenCalledWith("reconnect")
  })
})
