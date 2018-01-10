module.exports = {
  // REST
  lcdConnected: () => Promise.resolve(true),
  getKey: () => ({}),
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
  queryNonce: () => '123',
  buildSend: (args) => {
    if (args.to.addr.indexOf('fail') !== -1) return Promise.reject('Failed on purpose')
    return Promise.resolve(null)
  },
  coinTxs: () => Promise.resolve([]),
  candidates: () => Promise.resolve({data: []}),
  postTx: () => Promise.resolve({
    check_tx: { code: 0 },
    deliver_tx: { code: 0 }
  }),
  sign: () => Promise.resolve(null),

  // RPC
  rpc: {
    on: () => {},
    subscribe: () => {},
    validators: () => [],
    block: (args, cb) => cb({}),
    blockchain: (args, cb) => cb({}),
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
