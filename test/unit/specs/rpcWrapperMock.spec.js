describe("RPC Wrapper Mock", () => {
  let node = {}
  let wrapper

  beforeEach(() => {
    jest.resetModules()
    let mockedRpcWrapper = require("renderer/connectors/rpcWrapperMock.js")
    wrapper = mockedRpcWrapper(node)
    wrapper.rpcConnect("localhost")
  })

  it("outputs validators", done => {
    node.rpc.validators((err, data) => {
      expect(err).toBeNull()
      expect(data.validators).toBeDefined()
      done()
    })
  })

  it("outputs a block", done => {
    let height = 5
    node.rpc.block({ height: height, maxHeight: height }, (err, data) => {
      expect(err).toBeNull()
      expect(data.block).toBeDefined()
      done()
    })
  })

  it("outputs a block header", done => {
    let height = 5
    node.rpc.blockchain(
      { minHeight: height, maxHeight: height },
      (err, data) => {
        expect(err).toBeNull()
        expect(data.block_metas).toBeDefined()
        done()
      }
    )
  })

  it("outputs a status", done => {
    node.rpc.status((err, data) => {
      expect(err).toBeNull()
      expect(data.sync_info.latest_block_height).toBeDefined()
      done()
    })
  })

  it("receives a stream of blocks", done => {
    let blocks = []
    node.rpc.subscribe({ query: "tm.event = 'NewBlock'" }, (err, data) => {
      expect(err).toBeNull()
      expect(data.data.value.block).toBeDefined()
      blocks.push(data.data.value.block)
      if (blocks.length === 2) {
        done()
      }
    })
  })

  it("receives a stream of block headers", done => {
    let headers = []
    node.rpc.subscribe(
      { query: "tm.event = 'NewBlockHeader'" },
      (err, data) => {
        expect(err).toBeNull()
        expect(data.data.value.header).toBeDefined()
        headers.push(data.data.value.header)
        if (headers.length === 2) {
          done()
        }
      }
    )
  })
})
