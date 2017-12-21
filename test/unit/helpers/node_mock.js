module.exports = {
  // rest
  getKey: () => ({}),
  generateKey: () => ({key: '123'}),
  queryAccount: () => null,
  queryNonce: () => '123',
  buildSend: (args) => {
    if (args.to.addr.indexOf('fail') !== -1) return Promise.reject('Failed on purpose')
    return Promise.resolve(null)
  },
  coinTxs: () => Promise.resolve({}),
  candidates: () => Promise.resolve({data: []}),
  postTx: () => Promise.resolve({
    check_tx: { code: 0 },
    deliver_tx: { code: 0 }
  }),
  sign: () => Promise.resolve(null),

  rpc: {
    on: () => {},
    subscribe: () => {},
    validators: () => [],
    block: (args, cb) => cb({}),
    blockchain: (args, cb) => cb({})
  }
}
