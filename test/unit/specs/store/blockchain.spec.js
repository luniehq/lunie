import setup from '../../helpers/vuex-setup'

let instance = setup()

describe('Module: Blockchain', () => {
  let store, node
  let blockMeta = {
    header: {
      height: 100,
      time: 42
    }
  }

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
    node = test.node

    // prefill block metas
    store.state.blockchain.blockMetas = [blockMeta]
  })

  it('sets blocks', () => {
    store.commit('setBlock', { test: 'test' })
    expect(store.state.blockchain.block).toEqual({ test: 'test' })
  })

  it('sets block meta info', () => {
    store.commit('setBlockMetaInfo', { test: 'test' })
    expect(store.state.blockchain.blockMetaInfo).toEqual({ test: 'test' })
  })

  it('should query block info', async () => {
    store.state.blockchain.blockMetas = []
    node.rpc.blockchain = jest.fn(({ minHeight, maxHeight }, cb) => {
      cb(null, { block_metas: [blockMeta] })
    })

    let output = await store.dispatch('queryBlockInfo', 42)
    expect(output).toBe(blockMeta)
  })

  it('should reuse queried block info', async () => {
    store.state.blockchain.blockMetas = [blockMeta]
    node.rpc.blockchain = jest.fn()

    let output = await store.dispatch('queryBlockInfo', 100)
    expect(output).toBe(blockMeta)
    expect(node.rpc.blockchain).not.toHaveBeenCalled()
  })

  it('should show an info if block info is unavailable', async () => {
    store.state.blockchain.blockMetas = []
    node.rpc.blockchain = (props, cb) => cb('Error')
    let height = 100
    let output = await store.dispatch('queryBlockInfo', height)
    expect(output).toBe(null)
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it('should show an info if block is unavailable', async () => {
    store.state.blockchain.block = []
    node.rpc.block = (props, cb) => cb('Error')
    let height = 42
    let output = await store.dispatch('queryBlock', height)
    expect(output).toEqual({})
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it('queries a block and info for a certain height', async () => {
    node.rpc.block = (query, cb) => {
      cb(null, {
        block: { test: 'test' }
      })
    }
    node.rpc.blockchain = (query, cb) => {
      cb(null, {
        block_metas: [{ test: 'test2' }]
      })
    }
    await store.dispatch('getBlock', 42)
    expect(store.state.blockchain.block).toEqual({ test: 'test' })
    expect(store.state.blockchain.blockMetaInfo).toEqual({ test: 'test2' })
  })

  it('should remember the block height for the queried block', async () => {
    await store.dispatch('getBlock', 42)
    expect(store.state.blockchain.blockHeight).toBe(42)
  })

  it('should show that querying the block has finished', async () => {
    node.rpc.block = (query, cb) => {
      cb(null, {
        block: { test: 'test' }
      })
    }
    node.rpc.blockchain = (query, cb) => {
      cb(null, {
        block_metas: [{ test: 'test2' }]
      })
    }
    store.state.blockchain.blockLoading = true
    await store.dispatch('getBlock', 42)
    expect(store.state.blockchain.blockLoading).toBe(false)
  })

  it('should hide loading on an error', async () => {
    node.rpc.block = (query, cb) => {
      cb({ message: 'expected' }, {
        block: { test: 'test' }
      })
    }
    node.rpc.blockchain = (query, cb) => {
      cb(null, {
        block_metas: [{ test: 'test2' }]
      })
    }
    store.state.blockchain.blockLoading = true
    await store.dispatch('getBlock', 42)
    expect(store.state.blockchain.blockLoading).toBe(false)
  })

  it('should query for blocks on reconnection', () => {
    store.state.node.stopConnecting = true
    store.state.blockchain.blockLoading = true
    store.dispatch('reconnected')
  })

  it('should not query for blocks on reconnection if not stuck in loading', () => {
    store.state.node.stopConnecting = true
    store.state.blockchain.blockLoading = false
    store.dispatch('reconnected')
  })

  it('should subscribe to new blocks', () => {
    node.rpc.subscribe = (query, cb) => {
      cb(null, {
        data: {
          data: {
            block: { test: 'test' }
          }
        }
      })
    }
    store.dispatch('subscribeToBlocks')
    expect(store.state.blockchain.blocks[0]).toEqual({ test: 'test' })
  })

  it('should subscribe to new blocks', () => {
    node.rpc.subscribe = (query, cb) => {
      for (let i = 0; i < 25; i++) {
        cb(null, {
          data: {
            data: {
              block: { test: 'test' }
            }
          }
        })
      }
    }
    store.dispatch('subscribeToBlocks')
    expect(store.state.blockchain.blocks[0]).toEqual({ test: 'test' })
    expect(store.state.blockchain.blocks.length).toBe(19)
  })

  it('should handle errors', () => {
    node.rpc.subscribe = (query, cb) => {
      cb({
        message: 'expected error'
      })
    }
    store.dispatch('subscribeToBlocks')
    expect(store.state.blockchain.blocks.length).toBe(0)
    expect(store.state.notifications[0].title).toContain(`Error subscribing to new blocks`)
  })
})
