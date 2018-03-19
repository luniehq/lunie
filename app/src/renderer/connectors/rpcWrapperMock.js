const mockValidators = require('../../helpers/json/mock_validators.json')

let state = { blockMetas: createBlockMetas() }

const RpcClientMock = {
  on: () => {},
  subscribe: () => {},
  validators: () => mockValidators,
  block: (args, cb) => cb({}),
  blockchain: ({ minHeight, maxHeight }, cb) => cb(null, { block_metas: state.blockMetas.filter(b => b.header.height === minHeight) }),
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

function createBlockMetas () {
  let now = new Date()
  let blockMetas = (new Array(200)).fill(null).map((_, i) => {
    let time = new Date(now)
    time.setMinutes(time.getMinutes() - i)
    return {
      header: {
        height: 200 - i,
        time
      }
    }
  })

  return blockMetas
}
