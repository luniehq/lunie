let mockValidators = require('./json/validators.json')

module.exports = {
  // REST
  nodeIp: '127.0.0.1',
  relayPort: '9060',
  lcdPort: '9070',
  lcdConnected: () => Promise.resolve(true),
  getKey: () => ({
    address: 'someaddress'
  }),
  generateKey: () => ({
    key: '123',
    seed_phrase: 'a b c d e f g h i j k l'
  }),
  updateKey: () => {},
  listKeys: () => [],
  recoverKey: () => ({
    key: '123',
    seed_phrase: 'a b c d e f g h i j k l'
  }),
  queryAccount: () => null,
  queryNonce: () => ({ data: 123 }),
  buildSend: () => Promise.resolve(null),
  buildDelegate: () => Promise.resolve(null),
  buildUnbond: () => Promise.resolve(null),
  coinTxs: () => Promise.resolve([]),
  candidates: () => Promise.resolve({ data: [] }),
  sendTx: () => Promise.resolve(),
  postTx: () => Promise.resolve({
    check_tx: { code: 0 },
    deliver_tx: { code: 0 }
  }),
  sign: () => Promise.resolve(null),

  // RPC
  rpc: {
    on: () => {},
    subscribe: () => {},
    validators: () => mockValidators,
    block: (args, cb) => cb({}),
    blockchain: (args, cb) => cb(null, { block_metas: {} }),
    status: (cb) => cb(null, {
      latest_block_height: 42,
      node_info: {
        network: 'test-net'
      }
    })
  },
  initRPC: () => {},
  rpcReconnect: () => Promise.resolve('1.1.1.1')
}
