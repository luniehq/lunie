import blocks, { cache } from "src/vuex/modules/blocks.js"

describe(`Module: Blocks`, () => {
  let module, state, actions, node
  const height = 100
  const blockMeta = {
    header: {
      height,
      time: 42
    }
  }

  beforeEach(() => {
    node = {
      tendermint: {
        status: () => Promise.resolve({ sync_info: {} })
      },
      get: {
        block: () => ({
          block_meta: {
            block_id: {
              hash: `ABCD1234`
            }
          },
          block: {
            data: {
              txs: `txs`
            },
            header: {
              height: `100`,
              num_txs: 1200,
              proposer_address: `ABCDEFG123456HIJKLMNOP`
            },
            evidence: {
              evidence: `evidence`
            },
            last_commit: {
              precommits: [
                {
                  validator_address: `validator address`,
                  timestamp: `1990-10-19`,
                  round: 0
                }
              ]
            }
          }
        })
      }
    }
    module = blocks({
      node
    })
    state = module.state
    actions = module.actions
  })

  describe(`getBlockTxs`, () => {
    it(`should fetch block txs`, async () => {
      const txs = [
        {
          hash: `abcdefghijklm`
        }
      ]
      node.get.txsByHeight = () => Promise.resolve(txs)
      const dispatch = () => ({ header: { time: 100 } })
      const result = await actions.getBlockTxs({ dispatch }, `5`)
      expect(result).toEqual([
        { hash: "abcdefghijklm", height: "5", time: 100 }
      ])
    })

    it(`should fail if request to full node fails`, async () => {
      node.get.txsByHeight = () => Promise.reject(Error(`error`))
      const dispatch = jest.fn()
      expect(
        actions.getBlockTxs({ state, dispatch }, `5`)
      ).rejects.toThrowError("error")
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  it(`should query block info`, async () => {
    state.blockMetas = {}
    node.get.block = () => ({
      block_meta: blockMeta,
      block: {
        height: `42`
      }
    })

    const output = await actions.queryBlockInfo(
      { state, commit: jest.fn() },
      42
    )
    expect(output).toBe(blockMeta)
  })

  it(`should reinitialize subscriptions to blocks on reconnection`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    actions.reconnected({ commit, dispatch })
    expect(commit).toBeCalledWith(`setSubscription`, false)
    expect(dispatch).toBeCalledWith(`subscribeToBlocks`)
  })

  it(`should reuse queried block info`, async () => {
    state.blockMetas = {}
    state.blockMetas[100] = blockMeta

    node.tendermint.blockchain = jest.fn()

    const output = await actions.queryBlockInfo(
      { state, commit: jest.fn() },
      100
    )
    expect(output).toBe(blockMeta)
    expect(node.tendermint.blockchain).not.toHaveBeenCalled()
  })

  it(`should show an error if block info is unavailable`, async () => {
    const error = new Error(`err`)
    const getBlock = jest.fn().mockRejectedValue(error)
    const commit = jest.fn()
    const node = {
      get: {
        block: getBlock
      }
    }
    const module = blocks({
      node
    })
    const output = await module.actions.queryBlockInfo(
      {
        state: module.state,
        commit
      },
      1000
    )
    expect(commit.mock.calls).toEqual([
      [`setBlocksLoading`, true],
      [`setBlocksLoading`, false],
      [`setBlocksError`, error]
    ])

    expect(output).toBe(null)
  })

  it(`should not subscribe twice`, async () => {
    node.tendermint.status = () => Promise.resolve({ sync_info: {} })
    node.tendermint.subscribe = (query, cb) => {
      cb({ block: `yeah` })
    }

    const commit = jest.fn()
    const firstResponse = await actions.subscribeToBlocks({
      state,
      commit,
      dispatch: jest.fn()
    })
    expect(firstResponse).toBe(true)
    expect(commit).toHaveBeenCalledWith(`setSubscription`, true)

    const secondResponse = await actions.subscribeToBlocks({
      state: Object.assign({}, state, {
        subscription: true
      }),
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(secondResponse).toBe(false)
  })

  it(`should not subscribe if still syncing`, async () => {
    node.tendermint.status = () =>
      Promise.resolve({
        sync_info: {
          catching_up: true,
          latest_block_height: 42
        }
      })
    node.tendermint.subscribe = jest.fn()
    await actions.subscribeToBlocks({
      state,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(node.tendermint.subscribe.mock.calls.length).toBe(0)
  })

  it(`should subscribe if not syncing`, async () => {
    node.tendermint.status = () =>
      Promise.resolve({
        sync_info: {
          catching_up: false,
          latest_block_height: 42
        }
      })
    node.tendermint.subscribe = jest.fn()
    await actions.subscribeToBlocks({
      state,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(node.tendermint.subscribe.mock.calls.length).toBe(1)
  })

  it(`should dispatch successful subscription only if the subscription is inactive`, async () => {
    const node = {
      tendermint: {
        status: () =>
          Promise.resolve({
            sync_info: {
              latest_block_height: 0,
              catching_up: false
            }
          }),
        subscribe: (query, cb) => {
          cb({ block: { header: { height: 1 } } })
          expect(commit).toBeCalledWith(`setSubscription`, true)
          module.state.subscription = true
          cb({ block: { header: { height: 2 } } })
        }
      }
    }
    const module = blocks({
      node
    })
    const commit = jest.fn()
    await module.actions.subscribeToBlocks({
      state: module.state,
      dispatch: jest.fn(),
      commit
    })
    expect(commit.mock.calls).toEqual([
      [`setSubscribedRPC`, node.tendermint],
      [`setBlockHeight`, 0],
      [`setSyncing`, false],
      [`setBlocks`, []],
      [`setSubscription`, true],
      [`addBlock`, { header: { height: 1 } }],
      [`setBlockHeight`, 1],
      [`addBlock`, { header: { height: 2 } }],
      [`setBlockHeight`, 2]
    ])
  })

  it(`caches a certan number of blocks`, async () => {
    const block = 1
    expect(cache([], block, 1)).toEqual([1])
    expect(cache([2], block, 1)).toEqual([1])
    expect(cache([2], block, 2)).toEqual([1, 2])
  })
})

describe(`Mutations`, () => {
  let module, node, mutations

  beforeEach(() => {
    node = {}
    module = blocks({
      node
    })
    mutations = module.mutations
  })

  it(`should set the loading state`, async () => {
    const { setBlocksLoading } = mutations
    const state = {}
    setBlocksLoading(state, true)
    expect(state.loading).toEqual(true)
    setBlocksLoading(state, false)
    expect(state.loading).toEqual(false)
  })

  it(`should set the loaded state`, async () => {
    const { setBlocksLoaded } = mutations
    const state = {}
    setBlocksLoaded(state, true)
    expect(state.loaded).toEqual(true)
    setBlocksLoaded(state, false)
    expect(state.loaded).toEqual(false)
  })

  it(`should set the error state`, async () => {
    const { setBlocksError } = mutations
    const state = {}
    const error = new Error(`just another error`)
    setBlocksError(state, error)
    expect(state.error).toEqual(error)
  })

  it(`should set the syncing state`, async () => {
    const { setSyncing } = mutations
    const state = {}
    setSyncing(state, true)
    expect(state.syncing).toEqual(true)
  })

  it(`should set the blockMetas state`, async () => {
    const { setBlockMetas } = mutations
    const state = {}
    setBlockMetas(state, { block_id: `X` })
    expect(state.blockMetas).toEqual({ block_id: `X` })
  })

  it(`should set the blocks in the state`, async () => {
    const { setBlocks } = mutations
    const state = {}
    setBlocks(state, [])
    expect(state.blocks).toEqual([])
    setBlocks(state, [1, 2, 3])
    expect(state.blocks).toEqual([1, 2, 3])
  })

  it(`should add a block the blocks`, async () => {
    const { addBlock } = mutations
    const state = { blocks: [] }
    addBlock(state, 1)
    expect(state.blocks.length).toEqual(1)
    expect(state.blocks[0]).toEqual(1)
  })

  it(`should add a block the blocks state and keep the size to 1000`, async () => {
    const { addBlock } = mutations
    const state = { blocks: [...Array(1000).keys()] }
    addBlock(state, `new`)
    expect(state.blocks.length).toEqual(1000)
    expect(state.blocks[0]).toEqual(`new`)
  })

  it(`should set the subscribedRPC state`, async () => {
    const { setSubscribedRPC } = mutations
    const state = {}
    setSubscribedRPC(state, `Me`)
    expect(state.subscribedRPC).toEqual(`Me`)
  })

  it(`should set the subscription state`, async () => {
    const { setSubscription } = mutations
    const state = {}
    setSubscription(state, true)
    expect(state.subscription).toEqual(true)
  })
})
