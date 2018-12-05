import setup from "../../helpers/vuex-setup"
import connectionModule from "renderer/vuex/modules/connection.js"
import nodeMock from "../../helpers/node_mock.js"

let instance = setup()

describe(`Module: Connection`, () => {
  let store, node

  beforeEach(() => {
    jest.resetModules()
    let test = instance.shallow()
    store = test.store
    node = test.node

    node.rpcInfo.connected = true
    node.rpcReconnect = jest.fn(() => {
      node.rpcInfo.connected = true
      return Promise.resolve()
    })
  })

  it(`sets the header`, () => {
    store.dispatch(`setLastHeader`, {
      height: 5,
      chain_id: `test-chain`
    })
    expect(store.state.connection.lastHeader.height).toBe(5)
    expect(store.state.connection.lastHeader.chain_id).toBe(`test-chain`)
  })

  it(`checks for new validators`, async () => {
    jest.spyOn(node, `getValidatorSet`)
    store.commit(`setConnected`, true)
    // checks for validators only after having signed in
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
    await store.dispatch(`setLastHeader`, {
      height: 5,
      chain_id: `test-chain`,
      validators_hash: `1234567890123456789012345678901234567890`
    })
    expect(node.getValidatorSet).toHaveBeenCalled()
  })

  it(`sets connection state`, () => {
    expect(store.state.connection.connected).toBe(false)
    store.commit(`setConnected`, true)
    expect(store.state.connection.connected).toBe(true)
  })

  it(`sets the connected node`, () => {
    expect(store.state.connection.node).toBe(null)
    store.commit(`setNode`, {
      remoteLcdURL: `123.123.123.123`,
      localLcdURL: `124.124.124.124`
    })
    expect(store.state.connection.node).toEqual({
      remoteLcdURL: `123.123.123.123`,
      localLcdURL: `124.124.124.124`
    })
  })

  it(`triggers a reconnect`, () => {
    store.dispatch(`reconnect`)
    expect(node.rpcReconnect).toHaveBeenCalled()
  })

  it(`subscribes again on reconnect`, done => {
    node.rpc.status = () => done()
    store.dispatch(`reconnected`)
  })

  it(`should not reconnect if stop reconnecting is set`, () => {
    store.commit(`stopConnecting`, true)
    node.rpcReconnect = () => {
      throw Error(`Should not reconnect`)
    }
    store.dispatch(`reconnect`)
  })

  it(`reacts to rpc disconnection with reconnect`, done => {
    let failed = false
    node.rpcReconnect = () => {
      store.commit(`stopConnecting`, true)
      done()
    }
    node.rpc.on = jest.fn((value, cb) => {
      if (value === `error` && !failed) {
        failed = true
        cb({ message: `disconnected` })
        expect(store.state.connection.connected).toBe(false)
      }
    })
    store.dispatch(`rpcSubscribe`)
  })

  it(`should not reconnect on errors that do not mean disconnection`, done => {
    node.rpcReconnect = () => {
      throw Error(`Shouldnt reconnect`)
    }
    node.rpc.on = jest.fn((value, cb) => {
      if (value === `error`) {
        cb({ message: `some message` })
        expect(store.state.connection.connected).toBe(true)
        done()
      }
    })
    store.dispatch(`rpcSubscribe`)
  })

  it(`should set the initial status on subscription`, () => {
    node.rpc.status = cb =>
      cb(null, {
        sync_info: {
          latest_block_height: 42
        },
        node_info: { network: `test-net` }
      })
    store.dispatch(`rpcSubscribe`)
    expect(store.state.connection.connected).toBe(true)
    expect(store.state.connection.node.remoteLcdURL).toBe(
      `http://awesomenode.de:12345`
    )
    expect(store.state.connection.lastHeader.height).toBe(42)
    expect(store.state.connection.lastHeader.chain_id).toBe(`test-net`)
  })

  it(`should react to failing status calls`, async () => {
    let spy = jest.spyOn(console, `error`).mockImplementation(() => {})
    node.rpc.status = cb => cb({ message: `Expected` }, null)
    await store.dispatch(`rpcSubscribe`)
    store.state.connection.stopConnecting = true // prevent connection attempt loops
    expect(spy).toHaveBeenCalledWith({
      message: `Expected`
    })
    spy.mockRestore()
  })

  it(`should react to status updates`, () => {
    node.rpc.subscribe = (type, cb) => {
      if (type.query === `tm.event = 'NewBlockHeader'`) {
        cb(null, {
          data: {
            value: {
              header: {
                height: 43,
                chain_id: `test-net2`,
                validators_hash: `abcd`
              }
            }
          }
        })
      }
    }
    store.dispatch(`rpcSubscribe`)
    expect(store.state.connection.connected).toBe(true)
    expect(store.state.connection.lastHeader.height).toBe(43)
    expect(store.state.connection.lastHeader.chain_id).toBe(`test-net2`)
  })

  it(`should react to status updates errors`, () => {
    let spy = jest.spyOn(console, `error`).mockImplementation(() => {})
    node.rpc.subscribe = (type, cb) => {
      if (type.query === `tm.event = 'NewBlockHeader'`) {
        cb({ message: `Expected` }, null)
      }
    }
    store.dispatch(`rpcSubscribe`)
    expect(spy).toHaveBeenCalledWith(`error subscribing to headers`, {
      message: `Expected`
    })
    spy.mockRestore()
  })

  it(`should trigger reconnection if it started disconnected`, done => {
    jest.useFakeTimers()
    node.rpcInfo.connected = false
    node.rpcReconnect = () => {
      done()
    }
    store.dispatch(`rpcSubscribe`)
    jest.runAllTimers()
  })

  it(`should ping the node to check connection status`, done => {
    node.rpc.status = () => done()
    store.dispatch(`pollRPCConnection`)
    expect(store.state.connection.nodeTimeout).toBeDefined()
  })

  it(`should continue polling the connection status`, () => {
    jest.useFakeTimers()
    node.rpc.status = cb => cb()
    store.dispatch(`pollRPCConnection`)
    jest.runOnlyPendingTimers()
    expect(store.state.connection.nodeTimeout).toBeDefined()
  })

  it(`should signal if the rpc connection times out`, () => {
    jest.useFakeTimers()
    node.rpc.status = () => {}
    store.dispatch(`pollRPCConnection`, 10)
    jest.runOnlyPendingTimers()
    expect(store.state.connection.connected).toBe(false)
  })

  it(`should signal connected state if pinging rpc endpoint is successful`, () => {
    node.rpc.status = cb => {
      store.commit(`stopConnecting`, true)
      cb(null, { node_info: {} })
    }
    store.dispatch(`pollRPCConnection`, 50)
    expect(store.state.connection.connected).toBe(true)
  })

  it(`should not subscribe if stopConnecting active`, () => {
    store.commit(`stopConnecting`, true)
    node.subscribe = () => {
      throw Error(`Shouldnt subscribe`)
    }
    store.dispatch(`rpcSubscribe`)
  })

  it(`should set approval required state`, () => {
    store.commit(`setNodeApprovalRequired`, `abc`)

    expect(store.state.connection.approvalRequired).toBe(`abc`)
  })

  it(`should send approval of node hash`, () => {
    let { ipcRenderer } = require(`electron`)
    let spy = jest.spyOn(ipcRenderer, `send`)

    store.dispatch(`approveNodeHash`, `abc`)

    expect(spy).toHaveBeenCalledWith(`hash-approved`, `abc`)
    expect(store.state.connection.approvalRequired).toBe(null)
  })

  it(`should send disapproval of node hash`, () => {
    let { ipcRenderer } = require(`electron`)
    let spy = jest.spyOn(ipcRenderer, `send`)

    store.dispatch(`disapproveNodeHash`, `abc`)

    expect(spy).toHaveBeenCalledWith(`hash-disapproved`, `abc`)
    expect(store.state.connection.approvalRequired).toBe(null)
  })

  it(`should switch to the mocked node implemenation`, () => {
    let spy = jest.spyOn(node, `setup`)

    store.dispatch(`setMockedConnector`, true)

    expect(spy).toHaveBeenCalledWith(true)
  })

  it(`should stop the lcd if in mocked mode`, () => {
    let { ipcRenderer } = require(`electron`)
    let spy = jest.spyOn(ipcRenderer, `send`)

    store.dispatch(`setMockedConnector`, true)

    expect(spy).toHaveBeenCalledWith(`stop-lcd`)
  })

  it(`should log the user out if switched to live mode`, () => {
    store.dispatch(`setMockedConnector`, true)
    store.dispatch(`setMockedConnector`, false)

    expect(store.state.config.modals.session.state).toBe(`loading`)
    expect(store.state.user.signedIn).toBe(false)
  })

  it(`should check if the node has positively halted`, async () => {
    jest.useFakeTimers()
    let instance = connectionModule({ node: nodeMock })
    let state = instance.state
    let dispatch = jest.fn()
    instance.actions.checkNodeHalted({ state, dispatch }, 100000)
    expect(state.nodeHaltedTimeout).toBeDefined()
    // expire the halted check before a block was received
    jest.runAllTimers()
    expect(dispatch).toHaveBeenCalledWith(`nodeHasHalted`)
  })

  it(`should check if the node has negatively halted`, async () => {
    jest.useFakeTimers()
    let instance = connectionModule({ node: nodeMock })
    let state = instance.state
    let dispatch = jest.fn()
    instance.actions.checkNodeHalted({ state, dispatch }, 100000)
    state.lastHeader.height = 10
    // expire the halted check before a block was received
    jest.runAllTimers()
    expect(dispatch).not.toHaveBeenCalledWith(`nodeHasHalted`)
  })

  it(`should signal that a node has halted`, async () => {
    jest.useFakeTimers()
    let instance = connectionModule({ node: nodeMock })
    let state = instance.state
    let commit = jest.fn()
    let timeout = setTimeout(() => {}, 100000)
    state.nodeHaltedTimeout = timeout

    instance.actions.nodeHasHalted({ state, commit })

    expect(state.nodeHaltedTimeout).not.toBeDefined()
    expect(clearTimeout).toHaveBeenCalledWith(timeout)
    expect(commit).toHaveBeenCalledWith(`setModalNodeHalted`, true)
  })
})
