import setup from "../../helpers/vuex-setup"
import convertTx from "../../../../app/src/renderer/scripts/utils.js"

let instance = setup()

describe("Module: Blockchain", () => {
  // const convertTx = utils.default.convertTx
  let store, node
  let height = 100
  let blockMeta = {
    header: {
      height,
      time: 42
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

  it("sets block", () => {
    store.commit("setBlock", { test: "test" })
    expect(store.state.blockchain.block).toEqual({ test: "test" })
  })
  it("sets blocks", () => {
    let payload = [{ foo: "bar" }, { hello: "world" }]
    store.commit("setBlocks", payload)
    expect(store.state.blockchain.blocks).toEqual(payload)
  })

  it("sets block meta info", () => {
    store.commit("setBlockMetaInfo", { test: "test" })
    expect(store.state.blockchain.blockMetaInfo).toEqual({ test: "test" })
  })

  it("should query block info", async () => {
    store.state.blockchain.blockMetas = {}
    node.rpc.blockchain = jest.fn(({ minHeight, maxHeight }, cb) => {
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

  it("should show an info if block is unavailable", async () => {
    store.state.blockchain.block = []
    node.rpc.block = (props, cb) => cb("Error")
    let height = 42
    let output = await store.dispatch("queryBlock", height)
    expect(output).toEqual({})
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it("queries a block and info for a certain height", async () => {
    node.rpc.block = (query, cb) => {
      cb(null, { block: { test: "test" } })
    }
    node.rpc.blockchain = (query, cb) => {
      cb(null, { block_metas: [{ test: "test2" }] })
    }
    await store.dispatch("getBlock", 42)
    expect(store.state.blockchain.block).toEqual({ test: "test" })
    expect(store.state.blockchain.blockMetaInfo).toEqual({ test: "test2" })
  })

  it("should remember the block height for the queried block", async () => {
    await store.dispatch("getBlock", 42)
    expect(store.state.blockchain.blockHeight).toBe(42)
  })

  it("should show that querying the block has finished", async () => {
    node.rpc.block = (query, cb) => {
      cb(null, { block: { test: "test" } })
    }
    node.rpc.blockchain = (query, cb) => {
      cb(null, { block_metas: [{ test: "test2" }] })
    }
    store.state.blockchain.blockLoading = true
    await store.dispatch("getBlock", 42)
    expect(store.state.blockchain.blockLoading).toBe(false)
  })

  it("should hide loading on an error", async () => {
    node.rpc.block = (query, cb) => {
      cb({ message: "expected" }, { block: { test: "test" } })
    }
    node.rpc.blockchain = (query, cb) => {
      cb(null, { block_metas: [{ test: "test2" }] })
    }
    store.state.blockchain.blockLoading = true
    await store.dispatch("getBlock", 42)
    expect(store.state.blockchain.blockLoading).toBe(false)
  })

  it("should query for blocks on reconnection", () => {
    store.state.node.stopConnecting = true
    store.state.blockchain.blockLoading = true
    store.dispatch("reconnected")
  })

  it("should not query for blocks on reconnection if not stuck in loading", () => {
    store.state.node.stopConnecting = true
    store.state.blockchain.blockLoading = false
    store.dispatch("reconnected")
  })

  it("should subscribe to new blocks", () => {
    node.rpc.subscribe = (query, cb) => {
      cb(null, { data: { value: { block: { test: "test" } } } })
    }
    store.dispatch("subscribeToBlocks")
    expect(store.state.blockchain.blocks[0]).toEqual({ test: "test" })
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
    node.rpc.subscribe = (query, cb) => {
      cb({ message: "expected error" })
    }
    store.dispatch("subscribeToBlocks")
    expect(store.state.blockchain.blocks.length).toBe(0)
    expect(store.state.notifications[0].title).toContain(
      `Error subscribing to new blocks`
    )
  })

  it("should not subscribe if still syncing", async () => {
    node.rpc.status = cb => {
      cb(null, { syncing: true })
    }
    node.rpc.subscribe = jest.fn()
    store.dispatch("subscribeToBlocks")
    expect(node.rpc.subscribe.mock.calls.length).toBe(0)
  })

  it("should subscribe if not syncing", async () => {
    node.rpc.status = cb => {
      cb(null, { syncing: false })
    }
    node.rpc.subscribe = jest.fn()
    store.dispatch("subscribeToBlocks")
    expect(node.rpc.subscribe.mock.calls.length).toBe(1)
  })

  it("should convert tx strings correctly", async () => {
    let expectedHash = "bfbb60a6e34561b223a10973f7ea7e3b822d30d2"
    let txString =
      "5wEPKiyH+w4DAQoU2cEstRhv4AGBeXQv0xEO5TTGNGAWAwEKBXN0ZWFrEQAAAAAAAAABBAQWAwEKFO85c4xpK5f28LYmEaY7OdYfuYuxFgMBCgVzdGVhaxEAAAAAAAAAAQQEBBMRAAAAAAAAAAAEHgMBDxYk3mIggDMizvgRs6nMKxBEfkMszfCU2ds6N9b9QxnzU6bNzXsXPaHbKkCLqwKfTYiuSPRjyqMROHd4T1oLM2sdduX7o81C9a8EbUTOCoXFRmYM8L50NBhtYOunMK0gsCSL1474TOLU6TMBGQAAAAAAAAAGBAQ="
    let hash = await convertTx(txString)
    expect(hash).toBe(expectedHash)
  })

  it("should query txs", async () => {
    let txString =
      "5wEPKiyH+w4DAQoU2cEstRhv4AGBeXQv0xEO5TTGNGAWAwEKBXN0ZWFrEQAAAAAAAAABBAQWAwEKFO85c4xpK5f28LYmEaY7OdYfuYuxFgMBCgVzdGVhaxEAAAAAAAAAAQQEBBMRAAAAAAAAAAAEHgMBDxYk3mIggDMizvgRs6nMKxBEfkMszfCU2ds6N9b9QxnzU6bNzXsXPaHbKkCLqwKfTYiuSPRjyqMROHd4T1oLM2sdduX7o81C9a8EbUTOCoXFRmYM8L50NBhtYOunMK0gsCSL1474TOLU6TMBGQAAAAAAAAAGBAQ="
    node.rpc.block = (query, cb) => {
      cb(null, {
        block: {
          test: "test",
          height: 42,
          data: {
            txs: [txString]
          }
        }
      })
    }
    node.txs = hash => {
      return new Promise(resolve => {
        resolve({
          height: 42,
          test: "test"
        })
      })
    }
    expect(Object.keys(store.state.blockchain.blockTxs).length).toBe(0)
    await store.dispatch("getBlock", 42)
    let block = await store.dispatch("queryBlock", 42)
    let blockTxInfo = await store.dispatch("queryTxInfo", 42)
    expect(blockTxInfo[0].test).toBe("test")
    // block = await store.dispatch("queryTxInfo", 42)
    expect(Object.keys(store.state.blockchain.blockTxs).length).toBe(1)
  })

  it("should handle tx error", async () => {
    let txString =
      "5wEPKiyH+w4DAQoU2cEstRhv4AGBeXQv0xEO5TTGNGAWAwEKBXN0ZWFrEQAAAAAAAAABBAQWAwEKFO85c4xpK5f28LYmEaY7OdYfuYuxFgMBCgVzdGVhaxEAAAAAAAAAAQQEBBMRAAAAAAAAAAAEHgMBDxYk3mIggDMizvgRs6nMKxBEfkMszfCU2ds6N9b9QxnzU6bNzXsXPaHbKkCLqwKfTYiuSPRjyqMROHd4T1oLM2sdduX7o81C9a8EbUTOCoXFRmYM8L50NBhtYOunMK0gsCSL1474TOLU6TMBGQAAAAAAAAAGBAQ="
    node.rpc.block = (query, cb) => {
      cb(null, {
        block: {
          test: "test",
          height: 42,
          data: {
            txs: [txString]
          }
        }
      })
    }
    node.txs = hash => {
      return new Promise((resolve, reject) => {
        reject("asdf")
      })
    }

    try {
      await store.dispatch("getBlock", 42)
      expect(true).toBe(false)
    } catch (error) {
      expect(error).toBe("asdf")
    }
  })
})
