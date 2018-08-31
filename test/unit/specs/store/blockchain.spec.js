import setup from "../../helpers/vuex-setup"
import { getTxHash } from "../../../../app/src/renderer/scripts/tx-utils.js"
let instance = setup()

describe("Module: Blockchain", () => {
  let store, node
  let height = 100
  let blockMeta = {
    header: {
      height,
      time: 42
    }
  }
  const block = {
    test: "test",
    height: 42,
    time: "Good Morning",
    data: {
      txs: []
    }
  }

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
    node = test.node

    // prefill block metas
    store.state.blockchain.blockMetas = {}
    store.state.blockchain.blockMetas[height] = blockMeta
  })

  it("should query block info", async () => {
    store.state.blockchain.blockMetas = {}
    node.rpc.blockchain = jest.fn((ignored, cb) => {
      cb(null, { block_metas: [blockMeta] })
    })

    let output = await store.dispatch("queryBlockInfo", 42)
    expect(output).toBe(blockMeta)
  })

  it("should reuse queried block info", async () => {
    store.state.blockchain.blockMetas = {}
    store.state.blockchain.blockMetas[height] = blockMeta

    node.rpc.blockchain = jest.fn()

    let output = await store.dispatch("queryBlockInfo", 100)
    expect(output).toBe(blockMeta)
    expect(node.rpc.blockchain).not.toHaveBeenCalled()
  })

  it("should show an info if block info is unavailable", async () => {
    store.state.blockchain.blockMetas = {}
    node.rpc.blockchain = (props, cb) => cb("Error")
    let height = 100
    let output = await store.dispatch("queryBlockInfo", height)
    expect(output).toBe(null)
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it("should subscribe to new blocks", () => {
    node.rpc.subscribe = (query, cb) => {
      cb(null, { data: { value: { block: { test: "test" } } } })
    }
    store.dispatch("subscribeToBlocks")
    expect(store.state.blockchain.blocks[0]).toEqual({ test: "test" })
  })

  it("should not subscribe twice", async () => {
    let firstResponse = await store.dispatch("subscribeToBlocks")
    expect(firstResponse).toBe(true)
    let secondResponse = await store.dispatch("subscribeToBlocks")
    expect(secondResponse).toBe(false)
  })

  it("should subscribe to new blocks", () => {
    node.rpc.subscribe = (query, cb) => {
      for (let i = 0; i < 25; i++) {
        cb(null, { data: { value: { block: { test: "test" } } } })
      }
    }
    store.dispatch("subscribeToBlocks")
    expect(store.state.blockchain.blocks[0]).toEqual({ test: "test" })
    expect(store.state.blockchain.blocks.length).toBe(19)
  })

  it("should handle errors", () => {
    console.error = jest.fn()
    node.rpc.subscribe = (query, cb) => {
      cb({ message: "expected error" })
    }
    store.dispatch("subscribeToBlocks")
    expect(console.error.mock.calls.length).toBe(1)
  })

  it("should handle ignore already subscribed errors", () => {
    console.error = jest.fn()
    node.rpc.subscribe = (query, cb) => {
      cb({ message: "expected error", data: "already subscribed" })
    }
    store.dispatch("subscribeToBlocks")
    expect(console.error.mock.calls.length).toBe(1)
    expect(store.dispatch).not.toHaveBeenCalledWith("nodeHasHalted")
  })

  it("should not subscribe if still syncing", async () => {
    node.rpc.status = cb => {
      cb(null, {
        sync_info: {
          catching_up: true,
          latest_block_height: 42
        }
      })
    }
    node.rpc.subscribe = jest.fn()
    store.dispatch("subscribeToBlocks")
    expect(node.rpc.subscribe.mock.calls.length).toBe(0)
  })

  it("should subscribe if not syncing", async () => {
    node.rpc.status = cb => {
      cb(null, {
        sync_info: {
          catching_up: false,
          latest_block_height: 42
        }
      })
    }
    node.rpc.subscribe = jest.fn()
    store.dispatch("subscribeToBlocks")
    expect(node.rpc.subscribe.mock.calls.length).toBe(1)
  })

  it("should convert tx strings correctly", async () => {
    let expectedHash = "0a31fba9f6d7403b41f5e52c12b98246c7c649af"
    let txString =
      "4wHwYl3uCloqLIf6CikKFIPMHcOoYjqQbmtzFFdU3g967Y0/EhEKCmxvY2FsVG9rZW4SAzEwMBIpChSDzB3DqGI6kG5rcxRXVN4Peu2NPxIRCgpsb2NhbFRva2VuEgMxMDASCQoDEgEwEMCEPRp2CibrWumHIQLUKUS5mPDRAdBIB5lAw9AIh/aaAL9PTqArOWGO5fpsphJMf8SklUcwRQIhAM9qzjJSTxzXatI3ncHcb1cwIdCTU+oVP4V8RO6lzjcXAiAoS9XZ4e3I/1e/HonfHucRNYE65ioGk88q4dWPs9Z5LA=="
    let hash = await getTxHash(txString)
    expect(hash).toBe(expectedHash)
  })
})
