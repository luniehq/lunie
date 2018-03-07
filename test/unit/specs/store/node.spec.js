import setup from '../../helpers/vuex-setup'

let instance = setup()

describe('Module: Node', () => {
  let store, node

  beforeEach(() => {
    jest.resetModules()
    let test = instance.shallow()
    store = test.store
    node = test.node

    node.rpcOpen = true
    node.rpcReconnect = jest.fn(() => {
      node.rpcOpen = true
      return Promise.resolve()
    })
  })

  jest.useFakeTimers()

  afterEach(() => {
    jest.runAllTimers()
  })

  it('sets the header', () => {
    store.dispatch('setLastHeader', {
      height: 5,
      chain_id: 'test-chain'
    })
    expect(store.state.node.lastHeader.height).toBe(5)
    expect(store.state.node.lastHeader.chain_id).toBe('test-chain')
  })

  it('checks for new validators', done => {
    node.rpc.validators = () => done()
    store.dispatch('setLastHeader', {
      height: 5,
      chain_id: 'test-chain',
      validators_hash: '1234567890123456789012345678901234567890'
    })
  })

  it('sets connection state', () => {
    expect(store.state.node.connected).toBe(false)
    store.commit('setConnected', true)
    expect(store.state.node.connected).toBe(true)
  })

  it('triggers a reconnect', () => {
    store.dispatch('reconnect')
    expect(node.rpcReconnect).toHaveBeenCalled()
  })

  it('subscribes again on reconnect', done => {
    node.rpcReconnect = () => Promise.resolve('1.2.3.4')
    node.rpc.status = () => done()
    store.dispatch('reconnect')
  })

  it('should not reconnect if stop reconnecting is set', () => {
    store.commit('stopConnecting', true)
    node.rpcReconnect = () => {
      throw Error('Should not reconnect')
    }
    store.dispatch('reconnect')
  })

  it('reacts to rpc disconnection with reconnect', done => {
    let failed = false
    node.rpcReconnect = () => {
      store.commit('stopConnecting', true)
      done()
    }
    node.rpc.on = jest.fn((value, cb) => {
      if (value === 'error' && !failed) {
        failed = true
        cb({
          message: 'disconnected'
        })
        expect(store.state.node.connected).toBe(false)
      }
    })
    store.dispatch('nodeSubscribe')
  })

  it('should not reconnect on errors that do not mean disconnection', done => {
    node.rpcReconnect = () => {
      throw Error('Shouldnt reconnect')
    }
    node.rpc.on = jest.fn((value, cb) => {
      if (value === 'error') {
        cb({
          message: 'some message'
        })
        expect(store.state.node.connected).toBe(true)
        done()
      }
    })
    store.dispatch('nodeSubscribe')
  })

  it('should set the initial status', () => {
    node.rpc.status = (cb) => cb(null, {
      latest_block_height: 42,
      node_info: {
        network: 'test-net'
      }
    })
    store.dispatch('nodeSubscribe')
    expect(store.state.node.connected).toBe(true)
    expect(store.state.node.lastHeader.height).toBe(42)
    expect(store.state.node.lastHeader.chain_id).toBe('test-net')
  })

  it('should react to status updates', () => {
    node.rpc.subscribe = (type, cb) => {
      if (type.event === 'NewBlockHeader') {
        cb(null, {
          data: {
            data: {
              header: {
                height: 42,
                chain_id: 'test-net',
                validators_hash: 'abc'
              }
            }
          }
        })
      }
    }
    store.dispatch('nodeSubscribe')
    expect(store.state.node.connected).toBe(true)
    expect(store.state.node.lastHeader.height).toBe(42)
    expect(store.state.node.lastHeader.chain_id).toBe('test-net')
  })

  it('should check for an existing LCD connection', async () => {
    expect(await store.dispatch('checkConnection')).toBe(true)
    node.lcdConnected = () => Promise.reject()
    expect(await store.dispatch('checkConnection')).toBe(false)
    expect(store.state.notifications[0].body).toContain(`Couldn't initialize`)
  })

  it('should trigger reconnection if it started disconnected', done => {
    node.rpcOpen = false
    node.rpcReconnect = () => {
      done()
      node.rpcOpen = true
      return Promise.resolve('1.1.1.1')
    }
    store.dispatch('nodeSubscribe')
  })

  it('should ping the node to check connection status', done => {
    node.rpc.status = () => done()
    store.dispatch('pollRPCConnection')
    expect(store.state.node.nodeTimeout).toBeDefined()
  })

  it('should reconnect if pinging node timesout', done => {
    node.rpcReconnect = () => done()
    node.rpc.status = (cb) => {}
    store.dispatch('pollRPCConnection', 10)
  })

  it('should reconnect if pinging node fails', done => {
    node.rpcReconnect = () => {
      // restore status hook as it crashes the rest if not
      node.rpc.status = (cb) => {}
      done()
    }
    node.rpc.status = (cb) => cb('Error')
    store.dispatch('pollRPCConnection', 10)
  })

  it('should not reconnect if pinging node is successful', () => {
    node.rpc.status = (cb) => {
      store.commit('stopConnecting', true)
      cb(null, { node_info: {} })
    }
    node.rpcReconnect = () => {
      throw Error('Shouldnt reconnect')
    }
    store.dispatch('pollRPCConnection', 50)
  })
})
