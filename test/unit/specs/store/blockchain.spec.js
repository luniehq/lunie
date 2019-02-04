import { getTxHash } from "renderer/scripts/tx-utils.js"
import blockchainModule, { cache } from "renderer/vuex/modules/blockchain.js"

describe(`Module: Blockchain`, () => {
  let module, state, actions, node, mutations
  const height = 100
  const blockMeta = {
    header: {
      height,
      time: 42
    }
  }

  beforeEach(() => {
    node = {
      rpc: {
        status: () => Promise.resolve({ sync_info: {} })
      }
    }
    module = blockchainModule({
      node
    })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  it(`should query block info`, async () => {
    state.blockMetas = {}
    node.rpc.blockchain = () => Promise.resolve({ block_metas: [blockMeta] })

    const output = await actions.queryBlockInfo(
      { state, commit: jest.fn() },
      42
    )
    expect(output).toBe(blockMeta)
  })

  it(`should reuse queried block info`, async () => {
    state.blockMetas = {}
    state.blockMetas[100] = blockMeta

    node.rpc.blockchain = jest.fn()

    const output = await actions.queryBlockInfo(
      { state, commit: jest.fn() },
      100
    )
    expect(output).toBe(blockMeta)
    expect(node.rpc.blockchain).not.toHaveBeenCalled()
  })

  it(`should show an info if block info is unavailable`, async () => {
    jest.spyOn(console, `error`).mockImplementation(() => {})
    const error = new Error(`Error`)
    const commit = jest.fn()
    state.blockMetas = {}
    node.rpc.blockchain = () => Promise.reject(error)
    const output = await actions.queryBlockInfo({ state, commit }, 100)
    expect(output).toBe(null)
    expect(commit).toHaveBeenCalledWith(`setError`, error)
  })

  it(`should not subscribe twice`, async () => {
    node.rpc.status = () => Promise.resolve({ sync_info: {} })
    node.rpc.subscribe = (query, cb) => {
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
    node.rpc.status = () =>
      Promise.resolve({
        sync_info: {
          catching_up: true,
          latest_block_height: 42
        }
      })
    node.rpc.subscribe = jest.fn()
    await actions.subscribeToBlocks({
      state,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(node.rpc.subscribe.mock.calls.length).toBe(0)
  })

  it(`should subscribe if not syncing`, async () => {
    node.rpc.status = () =>
      Promise.resolve({
        sync_info: {
          catching_up: false,
          latest_block_height: 42
        }
      })
    node.rpc.subscribe = jest.fn()
    await actions.subscribeToBlocks({
      state,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(node.rpc.subscribe.mock.calls.length).toBe(1)
  })

  it(`should convert tx strings correctly`, async () => {
    const expectedHash = `0a31fba9f6d7403b41f5e52c12b98246c7c649af`
    const txString = `4wHwYl3uCloqLIf6CikKFIPMHcOoYjqQbmtzFFdU3g967Y0/EhEKCmxvY2FsVG9rZW4SAzEwMBIpChSDzB3DqGI6kG5rcxRXVN4Peu2NPxIRCgpsb2NhbFRva2VuEgMxMDASCQoDEgEwEMCEPRp2CibrWumHIQLUKUS5mPDRAdBIB5lAw9AIh/aaAL9PTqArOWGO5fpsphJMf8SklUcwRQIhAM9qzjJSTxzXatI3ncHcb1cwIdCTU+oVP4V8RO6lzjcXAiAoS9XZ4e3I/1e/HonfHucRNYE65ioGk88q4dWPs9Z5LA==`
    const hash = await getTxHash(txString)
    expect(hash).toBe(expectedHash)
  })

  it(`should dispatch successful subscription only if the subscription is inactive`, async () => {
    const node = {
      rpc: {
        status: () =>
          Promise.resolve({
            sync_info: {
              latest_block_height: 0,
              catching_up: false
            }
          }),
        subscribe: (query, cb) => {
          cb({ block: `subscribe here` })
          expect(commit).toBeCalledWith(`setSubscription`, true)
          module.state.subscription = true
          cb({ block: `already subscribed` })
        }
      }
    }
    const module = blockchainModule({
      node
    })
    const commit = jest.fn()
    await module.actions.subscribeToBlocks({
      state: module.state,
      dispatch: jest.fn(),
      commit
    })
    expect(commit.mock.calls).toEqual([
      [`setSubscribedRPC`, node.rpc],
      [`setBlockHeight`, 0],
      [`setSyncing`, false],
      ["setBlocks", []],
      [`setSubscription`, true],
      [`addBlock`, `subscribe here`],
      [`addBlock`, `already subscribed`]
    ])
  })

  it(`should get the peers`, async () => {
    const peers = [`a`, `b`, `c`]
    const node = {
      rpc: {
        net_info: () =>
          Promise.resolve({
            result: {
              peers
            }
          })
      }
    }
    const module = blockchainModule({
      node
    })
    const commit = jest.fn()
    await module.actions.getPeers({
      state: { connected: true },
      commit
    })
    expect(commit.mock.calls).toEqual([[`setPeers`, peers]])
  })

  it(`should handle errors`, async () => {
    const error = new Error(`err`)
    const node = {
      rpc: {
        blockchain: () => Promise.reject(error)
      }
    }
    const module = blockchainModule({
      node
    })
    const commit = jest.fn()
    await module.actions.queryBlockInfo(
      {
        state: module.state,
        commit
      },
      1
    )
    expect(commit.mock.calls).toEqual([
      [`setLoading`, true],
      [
        `notifyError`,
        { body: `err`, title: `Error fetching block information` }
      ],
      [`setLoading`, false],
      [`setError`, error]
    ])
  })

  it(`caches a certan number of blocks`, async () => {
    const block = 1
    expect(cache([], block, 1)).toEqual([1])
    expect(cache([2], block, 1)).toEqual([1])
    expect(cache([2], block, 2)).toEqual([1, 2])
  })
})
