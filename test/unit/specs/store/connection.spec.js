import connectionModule from "renderer/vuex/modules/connection.js"
import nodeMock from "../../helpers/node_mock.js"

const mockRootState = {
  user: {
    signedIn: true
  }
}

describe(`Module: Connection`, () => {
  let module, state, actions, mutations, node

  beforeEach(() => {
    node = {
      rpc: {
        on: jest.fn(),
        status: jest.fn(() =>
          Promise.resolve({ sync_info: {}, node_info: {} })
        ),
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
    module = connectionModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`sets the header`, () => {
    const dispatch = jest.fn()
    actions.setLastHeader(
      { state, rootState: mockRootState, dispatch },
      {
        height: 5,
        chain_id: `test-chain`
      }
    )
    expect(state.lastHeader.height).toBe(5)
    expect(state.lastHeader.chain_id).toBe(`test-chain`)
  })

  it(`checks for new validators`, async () => {
    const dispatch = jest.fn()
    actions.setLastHeader(
      { state, rootState: mockRootState, dispatch },
      {
        height: 5,
        chain_id: `test-chain`
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`maybeUpdateValidators`, {
      height: 5,
      chain_id: `test-chain`
    })
  })

  it(`sets connection state`, () => {
    expect(state.connected).toBe(false)
    mutations.setConnected(state, true)
    expect(state.connected).toBe(true)
  })

  it(`sets the connected node`, () => {
    expect(state.node).toBe(null)
    mutations.setNode(state, {
      remoteLcdURL: `123.123.123.123`,
      localLcdURL: `124.124.124.124`
    })
    expect(state.node).toEqual({
      remoteLcdURL: `123.123.123.123`,
      localLcdURL: `124.124.124.124`
    })
  })

  it(`triggers a reconnect`, () => {
    const commit = jest.fn()
    actions.reconnect({ state, commit })

    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(node.rpcConnect).toHaveBeenCalled()
  })

  it(`should not reconnect if stop reconnecting is set`, () => {
    const commit = jest.fn()
    actions.reconnect({
      state: {
        stopConnecting: true
      },
      commit
    })

    expect(commit).not.toHaveBeenCalledWith(`setConnected`, false)
    expect(node.rpcConnect).not.toHaveBeenCalled()
  })

  it(`reacts to rpc disconnection with reconnect`, () => {
    node.rpc.on = jest.fn((value, cb) => {
      cb({ message: `disconnected` })
    })
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.rpcSubscribe({ commit, dispatch })

    expect(commit).toHaveBeenCalledWith(`setConnected`, false)
    expect(dispatch).toHaveBeenCalledWith(`reconnect`)
  })

  it(`should not reconnect on errors that do not mean disconnection`, () => {
    node.rpc.on = jest.fn((value, cb) => {
      cb({ message: `some message` })
    })
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.rpcSubscribe({ commit, dispatch })

    expect(commit).not.toHaveBeenCalledWith(`setConnected`, false)
    expect(dispatch).not.toHaveBeenCalledWith(`reconnect`)
  })

  it(`should set the initial status on subscription`, async () => {
    node.rpc.status = () =>
      Promise.resolve({
        sync_info: {
          latest_block_height: 42
        },
        node_info: { network: `test-net` }
      })
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.rpcSubscribe({ commit, dispatch })

    expect(dispatch).toHaveBeenCalledWith(`setLastHeader`, {
      height: 42,
      chain_id: `test-net`
    })
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
    await actions.rpcSubscribe({ commit, dispatch })

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
    actions.rpcSubscribe({ commit: jest.fn(), dispatch }).then(() => {
      expect(dispatch).toHaveBeenCalledWith(`reconnect`)
      done()
    })
    jest.runAllTimers()
  })

  it(`should ping the node to check connection status`, () => {
    actions.pollRPCConnection({ state, dispatch: jest.fn() })
    expect(node.rpc.status).toHaveBeenCalled()
    expect(state.nodeTimeout).toBeDefined()
  })

  it(`should continue polling the connection status`, () => {
    jest.useFakeTimers()
    actions.pollRPCConnection({ state, dispatch: jest.fn() })
    jest.runOnlyPendingTimers()
    expect(state.nodeTimeout).toBeDefined()
  })

  it(`should signal if the rpc connection times out`, () => {
    jest.useFakeTimers()
    actions.pollRPCConnection({ state, dispatch: jest.fn() }, 10)
    jest.runOnlyPendingTimers()
    expect(state.connected).toBe(false)
  })

  it(`should signal connected state if pinging rpc endpoint is successful`, async () => {
    await actions.pollRPCConnection({ state, dispatch: jest.fn() }, 10)
    expect(state.connected).toBe(true)
  })

  it(`should not subscribe if stopConnecting active`, () => {
    state.stopConnecting = true
    actions.rpcSubscribe({ commit: jest.fn(), dispatch: jest.fn() })
    expect(node.rpc.subscribe).not.toHaveBeenCalled()
  })

  it(`should switch to the mocked node implemenation`, () => {
    actions.setMockedConnector(
      { state, dispatch: jest.fn(), commit: jest.fn() },
      true
    )

    expect(node.setup).toHaveBeenCalledWith(true)
  })

  it(`should log the user out if switched mocked mode`, () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.setMockedConnector({ state, dispatch, commit }, false)

    expect(dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`should check if the node has positively halted`, async () => {
    jest.useFakeTimers()
    let dispatch = jest.fn()
    actions.checkNodeHalted({ state, dispatch }, 100000)
    expect(state.nodeHaltedTimeout).toBeDefined()
    // expire the halted check before a block was received
    jest.runAllTimers()
    expect(dispatch).toHaveBeenCalledWith(`nodeHasHalted`)
  })

  it(`should check if the node has negatively halted`, async () => {
    jest.useFakeTimers()
    let dispatch = jest.fn()
    actions.checkNodeHalted({ state, dispatch }, 100000)
    state.lastHeader.height = 10
    // expire the halted check before a block was received
    jest.runAllTimers()
    expect(dispatch).not.toHaveBeenCalledWith(`nodeHasHalted`)
  })

  it(`should signal that a node has halted`, async () => {
    jest.useFakeTimers()
    let commit = jest.fn()
    let timeout = setTimeout(() => {}, 100000)
    state.nodeHaltedTimeout = timeout

    actions.nodeHasHalted({ state, commit })

    expect(state.nodeHaltedTimeout).not.toBeDefined()
    expect(clearTimeout).toHaveBeenCalledWith(timeout)
    expect(commit).toHaveBeenCalledWith(`setModalNodeHalted`, true)
  })
})
