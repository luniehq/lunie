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
    validators: cb => cb(null, { validators: mockValidators }),
    block: (args, cb) =>
      cb(null, {
        block: {
          last_commit: {
            precommits: [
              {
                signature: {
                  data:
                    "12C0D8893B8A38224488DC1DE6270DF76BB1A5E9DB1C68577706A6A97C6EC34FFD12339183D5CA8BC2F46148773823DE905B7F6F5862FD564038BB7AE03BF50D",
                  type: "ed25519"
                },
                block_id: {
                  parts: {
                    hash: "3C78F00658E06744A88F24FF97A0A5011139F34A",
                    total: 1
                  },
                  hash: "F70588DAB36BDA5A953D548A16F7D48C6C2DFD78"
                },
                type: 2,
                round: 0,
                height: 9,
                validator_index: 0,
                validator_address: "E89A51D60F68385E09E716D353373B11F8FACD62"
              }
            ],
            blockID: {
              parts: {
                hash: "3C78F00658E06744A88F24FF97A0A5011139F34A",
                total: 1
              },
              hash: "F70588DAB36BDA5A953D548A16F7D48C6C2DFD78"
            }
          },
          data: {
            txs: []
          },
          header: {
            app_hash: "",
            chain_id: "test-chain-6UTNIN",
            height: 10,
            time: "2017-05-29T15:05:53.877Z",
            num_txs: 0,
            last_block_id: {
              parts: {
                hash: "3C78F00658E06744A88F24FF97A0A5011139F34A",
                total: 1
              },
              hash: "F70588DAB36BDA5A953D548A16F7D48C6C2DFD78"
            },
            last_commit_hash: "F31CC4282E50B3F2A58D763D233D76F26D26CABE",
            data_hash: "",
            validators_hash: "9365FC80F234C967BD233F5A3E2AB2F1E4B0E5AA"
          }
        },
        block_meta: {
          header: {
            app_hash: "",
            chain_id: "test-chain-6UTNIN",
            height: 10,
            time: "2017-05-29T15:05:53.877Z",
            num_txs: 0,
            last_block_id: {
              parts: {
                hash: "3C78F00658E06744A88F24FF97A0A5011139F34A",
                total: 1
              },
              hash: "F70588DAB36BDA5A953D548A16F7D48C6C2DFD78"
            },
            last_commit_hash: "F31CC4282E50B3F2A58D763D233D76F26D26CABE",
            data_hash: "",
            validators_hash: "9365FC80F234C967BD233F5A3E2AB2F1E4B0E5AA"
          },
          block_id: {
            parts: {
              hash: "277A4DBEF91483A18B85F2F5677ABF9694DFA40F",
              total: 1
            },
            hash: "96B1D2F2D201BA4BC383EB8224139DB1294944E5"
          }
        }
      }),
    blockchain: (args, cb) =>
      cb(null, {
        block_metas: [
          {
            header: {
              app_hash: "",
              chain_id: "test-chain-6UTNIN",
              height: 10,
              time: "2017-05-29T15:05:53.877Z",
              num_txs: 0,
              last_block_id: {
                parts: {
                  hash: "3C78F00658E06744A88F24FF97A0A5011139F34A",
                  total: 1
                },
                hash: "F70588DAB36BDA5A953D548A16F7D48C6C2DFD78"
              },
              last_commit_hash: "F31CC4282E50B3F2A58D763D233D76F26D26CABE",
              data_hash: "",
              validators_hash: "9365FC80F234C967BD233F5A3E2AB2F1E4B0E5AA"
            },
            block_id: {
              parts: {
                hash: "277A4DBEF91483A18B85F2F5677ABF9694DFA40F",
                total: 1
              },
              hash: "96B1D2F2D201BA4BC383EB8224139DB1294944E5"
            }
          }
        ],
        last_height: 5493
      }),
    status: cb =>
      cb(null, {
        node_info: {
          id: "562dd7f579f0ecee8c94a11a3c1e378c1876f433",
          listen_addr: "192.168.1.2:26656",
          network: "test-chain-I6zScH",
          version: "0.19.0",
          channels: "4020212223303800",
          moniker: "Ethans-MacBook-Pro.local",
          other: [
            "amino_version=0.9.8",
            "p2p_version=0.5.0",
            "consensus_version=v1/0.2.2",
            "rpc_version=0.7.0/3",
            "tx_index=on",
            "rpc_addr=tcp://0.0.0.0:26657"
          ]
        },
        sync_info: {
          latest_block_hash: "2D4D7055BE685E3CB2410603C92AD37AE557AC59",
          latest_app_hash: "0000000000000000",
          latest_block_height: 231,
          latest_block_time: "2018-04-27T23:18:08.459766485-04:00",
          syncing: false
        },
        validator_info: {
          address: "5875562FF0FFDECC895C20E32FC14988952E99E7",
          pub_key: {
            type: "AC26791624DE60",
            value: "PpDJRUrLG2RgFqYYjawfn/AcAgacSXpLFrmfYYQnuzE="
          },
          voting_power: 10
        }
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
