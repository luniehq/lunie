import connectionModule from "src/vuex/modules/connection.js"

jest.mock(`src/config.js`, () => ({
  stargate: `https://voyager.lol`,
  rpc: `https://voyager-rpc.lol`
}))

describe(`Module: Connection`, () => {
  let module, state, actions, mutations, node

  beforeEach(() => {
    node = {
      rpc: {
        on: jest.fn(),
        status: jest.fn(() =>
          Promise.resolve({
            sync_info: {},
            node_info: {}
          })
        ),
        health: jest.fn(),
        subscribe: jest.fn()
      },
      rpcInfo: {
        connected: true
      },
      rpcConnect: jest.fn(() => {
        node.rpcInfo.connected = true
        return Promise.resolve()
      }),
      rpcDisconnect: jest.fn(),
      setup: jest.fn()
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
  })

  it(`triggers a reconnect`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.connect({
      state,
      commit,
      dispatch
    })

    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(node.rpcConnect).toHaveBeenCalled()

    // on success should trigger connection follow up events
    expect(dispatch).toHaveBeenCalledWith(`reconnected`)
    expect(dispatch).toHaveBeenCalledWith(`rpcSubscribe`)
    expect(dispatch).toHaveBeenCalledWith(`subscribeToBlocks`)
  })

  it(`should not reconnect if stop reconnecting is set`, () => {
    const commit = jest.fn()
    actions.connect({
      state: Object.assign({}, state, {
        stopConnecting: true
      }),
      commit
    })

    expect(commit).not.toHaveBeenCalledWith(`setConnected`, false)
    expect(node.rpcConnect).not.toHaveBeenCalled()
  })

  it(`reacts to rpc disconnection with reconnect`, () => {
    node.rpc.on = jest.fn((value, cb) => {
      cb({
        message: `disconnected`
      })
    })
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.rpcSubscribe({
      rootState: { session: { signedIn: true } },
      commit,
      dispatch
    })

    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(dispatch).toHaveBeenCalledWith(`connect`)
  })

  it(`should not reconnect on errors that do not mean disconnection`, () => {
    node.rpc.on = jest.fn((value, cb) => {
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
    node.rpc.status = () =>
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
    node.rpc.status = () =>
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
    node.rpc.subscribe = (type, cb) => {
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

  it(`should trigger reconnection if it started disconnected`, async done => {
    jest.useFakeTimers()

    node.rpcInfo.connected = false

    const dispatch = jest.fn()
    actions
      .rpcSubscribe({
        rootState: { session: { signedIn: true } },
        state,
        commit: jest.fn(),
        dispatch
      })
      .then(() => {
        expect(dispatch).toHaveBeenCalledWith(`connect`)
        done()
      })
    jest.runAllTimers()
  })

  it(`should continue polling the connection status`, async () => {
    const dispatch = jest.fn()
    jest.useFakeTimers()
    await actions.pollRPCConnection({
      state,
      dispatch
    })
    jest.runOnlyPendingTimers()
    expect(dispatch).toHaveBeenCalledWith(`pollRPCConnection`)
  })

  it(`should signal if the rpc connection times out`, async () => {
    jest.spyOn(console, `error`).mockImplementationOnce(() => {})
    const dispatch = jest.fn()
    const commit = jest.fn()
    jest.useFakeTimers()
    await actions.pollRPCConnection({
      state: Object.assign({}, state, {
        externals: {
          health: jest.fn().mockRejectedValueOnce(new Error(`expected`))
        }
      }),
      commit,
      dispatch
    })
    jest.runOnlyPendingTimers()
    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(dispatch).toHaveBeenCalledWith(`connect`)
  })

  it(`should not subscribe if stopConnecting active`, () => {
    state.stopConnecting = true
    actions.rpcSubscribe({
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(node.rpc.subscribe).not.toHaveBeenCalled()
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
})
