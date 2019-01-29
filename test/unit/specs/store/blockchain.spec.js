import { getTxHash } from "../../../../app/src/renderer/scripts/tx-utils.js"
import blockchainModule from "renderer/vuex/modules/blockchain.js"

describe(`Module: Blockchain`, () => {
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
      rpc: {
        status: () => Promise.resolve({ sync_info: {} })
      }
    }
    module = blockchainModule({
      node
    })
    state = module.state
    actions = module.actions
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
    state.blockMetas = {}
    node.rpc.blockchain = () => Promise.reject(new Error(`Error`))
    const output = await actions.queryBlockInfo(
      { state, commit: jest.fn() },
      100
    )
    expect(output).toBe(null)
    expect(state.error).toEqual(new Error(`Error`))
  })

  it(`should not subscribe twice`, async () => {
    node.rpc.status = () => Promise.resolve({ sync_info: {} })
    node.rpc.subscribe = (query, cb) => {
      cb()
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
          cb()
          expect(commit).toBeCalledWith(`setSubscription`, true)
          module.state.subscription = true
          cb()
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
      [`setSubscription`, true]
    ])
  })
})
