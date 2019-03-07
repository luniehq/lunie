"use strict"

const mockValidators = require(`src/helpers/json/mock_validators.json`)
const mockLcd = require(`../../../app/src/renderer/connectors/lcdClientMock.js`)

module.exports = {
  // REST
  relayPort: `9060`,
  lcdPort: `9070`,
  remoteLcdURL: `http://awesomenode.de:12345`,
  localLcdURL: `https://localhost:9876`,
  lcdConnected: () => Promise.resolve(true),
  getAccount: () => null,
  buildDelegate: () => Promise.resolve(null),
  buildUnbond: () => Promise.resolve(null),
  coinTxs: () => Promise.resolve([]),
  candidates: () => Promise.resolve({
    data: []
  }),
  send: () => Promise.resolve({}),
  ibcSend: () => Promise.resolve({}),
  candidate: () =>
    Promise.resolve({
      data: {
        pub_key: {
          data: ``
        },
        description: {
          name: `test`
        }
      }
    }),
  bondingsByDelegator: () =>
    Promise.resolve({
      data: {
        PubKey: {
          data: ``
        },
        Shares: 0
      }
    }),

  // RPC
  rpc: {
    on: () => {},
    subscribe: () => {},
    async validators() {
      return {
        validators: mockValidators
      }
    },
    async block() {},
    async blockchain() {
      return {
        block_metas: {}
      }
    },
    async status() {
      return {
        sync_info: {
          latest_block_height: 42
        },
        node_info: {
          network: `test-net`
        }
      }
    },
    async net_info() {
      return {
        result: {
          peers: [
            {
              node_info: {
                protocol_version: {
                  p2p: `5`,
                  block: `8`,
                  app: `0`
                },
                id: `73173022bd8913e41e04c17a884edb6b35256db2`,
                listen_addr: `tcp://0.0.0.0:26656`,
                network: `testnet`,
                version: `0.27.4`,
                channels: `4020212223303800`,
                moniker: `operator1`,
                other: {
                  tx_index: `on`,
                  rpc_address: `tcp://0.0.0.0:26657`
                }
              }
            }
          ]
        }
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
