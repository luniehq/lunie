module.exports = {
  generateKey: () => ({key: '123'}),
  queryAccount: () => null,
  queryNonce: () => '123',
  buildSend: (args) => {
    if (args.to.addr.indexOf('fail') !== -1) return Promise.reject('Failed on purpose')
    return Promise.resolve(null)
  },
  postTx: () => Promise.resolve({
    check_tx: { code: 0 },
    deliver_tx: { code: 0 }
  }),
  sign: () => Promise.resolve(null),
  coinTxs: () => Promise.resolve(null),

  rpc: {
    block: (args, cb) => cb({}),
    blockchain: (args, cb) => cb({})
  }
}
