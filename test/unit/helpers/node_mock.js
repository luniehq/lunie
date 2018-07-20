let mockValidators = require("src/helpers/json/mock_validators.json")
let mockLcd = require("../../../app/src/renderer/connectors/lcdClientMock.js")

module.exports = {
  // REST
  relayPort: "9060",
  lcdPort: "9070",
  lcdConnected: () => Promise.resolve(true),
  getKey: () => ({ address: "someaddress" }),
  generateSeed: () => "a b c d e f g h i j k l",
  updateKey: () => {},
  listKeys: () => [],
  storeKey: () => ({
    key: "123",
    password: "1234567890",
    seed_phrase: "a b c d e f g h i j k l"
  }),
  queryAccount: () => null,
  buildDelegate: () => Promise.resolve(null),
  buildUnbond: () => Promise.resolve(null),
  coinTxs: () => Promise.resolve([]),
  candidates: () => Promise.resolve({ data: [] }),
  send: () => Promise.resolve({}),
  ibcSend: () => Promise.resolve({}),
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
        sync_info: {
          latest_block_height: 42
        },
        node_info: { network: "test-net" }
      })
  },
  rpcInfo: {
    connected: true,
    connecting: false,
    nodeIP: "127.0.0.1"
  },
  rpcConnect: () => {},
  rpcDisconnect: () => {},
  rpcReconnect: () => Promise.resolve("1.1.1.1"),
  setup: () => {},

  ...mockLcd
}
