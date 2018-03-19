const mockValidators = require('../../helpers/json/mock_validators.json')

let state = { blockMetas: [], blocks: [] }
createBlockMetas(state)

const RpcClientMock = {
  on: () => {},
  subscribe: (args, cb) => {
    if (args.query === "tm.event = 'NewBlock'") {
      produceBlocks(cb)
    }
    if (args.query === "tm.event = 'NewBlockHeader'") {
      produceBlockHeaders(cb)
    }
  },
  validators: () => mockValidators,
  block: ({ minHeight, maxHeight }, cb) => cb(null, { block: state.blocks.find(b => b.header.height === minHeight) }),
  blockchain: ({ minHeight, maxHeight }, cb) => cb(null, { block_metas: state.blockMetas.filter(b => b.height === minHeight) }),
  status: (cb) => cb(null, {
    latest_block_height: 42,
    node_info: { network: 'mock-chain' }
  })
}

module.exports = function setRPCWrapperMock (container) {
  let rpcWrapper = {
    // RPC
    // made this a subobject so we can manipulate it in here while assigning it to the outer node object
    rpcInfo: {
      nodeIP: '127.0.0.1',
      connecting: false,
      connected: true
    },
    initRPC () {
      container.rpc = RpcClientMock
    },
    rpcReconnect: async () => {
      return '127.0.0.1'
    }
  }

  return rpcWrapper
}

function createBlockMeta (time, height) {
  return {
    header: { time, height },
    block_id: { hash: makeBlockHash() },
    height,
    chain_id: 'mock-chain',
    last_block_id: { hash: makeBlockHash() }
  }
}

function createBlock (height) {
  return {
    hash: makeBlockHash(),
    header: {
      height,
      chain_id: 'mock-chain',
      last_block_id: {
        hash: makeBlockHash(),
        parts: { total: 0, hash: makeBlockHash() }
      },
      num_txs: 0,
      last_commit_hash: makeBlockHash(),
      validators_hash: makeBlockHash(),
      app_hash: makeBlockHash()
    },
    last_commit: { precommits: [] },
    data: { txs: [] }
  }
}

function createBlockMetas (state) {
  let now = new Date()
  new Array(200).fill(null).forEach((_, i) => {
    let time = new Date(now)
    time.setMinutes(time.getMinutes() - i)

    state.blockMetas.push(createBlockMeta(time, i))
    state.blocks.push(createBlock(i))
  })
}

async function produceBlockHeaders (cb) {
  let height = 200
  while (true) {
    let newBlockHeader = createBlockMeta(Date.now(), ++height)
    state.blockMetas.push(newBlockHeader)
    cb(null, { data: { data: { header: newBlockHeader } } })
    await sleep(1000)
  }
}

async function produceBlocks (cb) {
  let height = 200
  while (true) {
    let newBlock = createBlock(++height)
    state.blocks.push(newBlock)
    cb(null, { data: { data: { block: newBlock } } })
    await sleep(1000)
  }
}

function makeBlockHash () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  for (var i = 0; i < 40; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

function sleep (ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
