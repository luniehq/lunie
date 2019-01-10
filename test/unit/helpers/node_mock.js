"use strict"

let mockValidators = require(`src/helpers/json/mock_validators.json`)
let mockLcd = require(`../../../app/src/renderer/connectors/lcdClientMock.js`)

module.exports = {
  // REST
  relayPort: `9060`,
  lcdPort: `9070`,
  remoteLcdURL: `http://awesomenode.de:12345`,
  localLcdURL: `https://localhost:9876`,
  lcdConnected: () => Promise.resolve(true),
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
        pub_key: { data: `` },
        description: { name: `test` }
      }
    }),
  bondingsByDelegator: () =>
    Promise.resolve({
      data: {
        PubKey: { data: `` },
        Shares: 0
      }
    }),

  // RPC
  rpc: {
    on: () => {},
    subscribe: () => {},
    async validators() {
      return { validators: mockValidators }
    },
    async block() {},
    async blockchain() {
      return { block_metas: {} }
    },
    async status() {
      return {
        sync_info: {
          latest_block_height: 42
        },
        node_info: { network: `test-net` }
      }
    }
  },
  rpcInfo: {
    connected: true,
    connecting: false
  },
  rpcConnect: () => {},
  rpcDisconnect: () => {},
  setup: () => {},

  ...mockLcd
}
