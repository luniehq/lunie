let mockValidators = require("src/helpers/json/mock_validators.json")

// XXX use lcdclientmock instead of this dup?
module.exports = {
  // REST
  relayPort: "9060",
  lcdPort: "9070",
  lcdConnected: () => Promise.resolve(true),
  getKey: () => ({ address: "someaddress" }),
  generateKey: () => ({
    key: "123",
    seed_phrase: "a b c d e f g h i j k l"
  }),
  updateKey: () => {},
  listKeys: () => [],
  recoverKey: () => ({
    key: "123",
    seed_phrase: "a b c d e f g h i j k l"
  }),
  queryAccount: () => null,
  queryNonce: () => ({ data: 123 }),
  buildDelegate: () => Promise.resolve(null),
  buildUnbond: () => Promise.resolve(null),
  coinTxs: () => Promise.resolve([]),
  candidates: () => Promise.resolve({ data: [] }),
  buildSend: () => Promise.resolve({}),
  sendTx: () => Promise.resolve(),
  postTx: () =>
    Promise.resolve({
      check_tx: { code: 0 },
      deliver_tx: { code: 0 }
    }),
  sign: () => Promise.resolve(null),
  candidate: () =>
    Promise.resolve({
      data: {
        pub_key: { data: "" },
        description: { name: "test" }
      }
    }),
  bondingsByDelegator: () =>
    Promise.resolve({
      data: {
        PubKey: { data: "" },
        Shares: 0
      }
    }),

  // RPC
  rpc: {
    on: () => {},
    subscribe: () => {},
    validators: () => mockValidators,
    block: (args, cb) => cb({}),
    blockchain: (args, cb) => cb(null, { block_metas: {} }),
    status: cb =>
      cb(null, {
        latest_block_height: 42,
        node_info: { network: "test-net" }
      })
  },
  rpcInfo: {
    connected: true,
    connecting: false,
    nodeIP: "127.0.0.1"
  },
  rpcConnect: () => {},
  rpcReconnect: () => Promise.resolve("1.1.1.1")
}
