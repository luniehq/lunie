const mockFsExtra = require("../helpers/fs-mock").default
let Addressbook

const mockConfig = {
  default_tendermint_port: 26657
}

describe("Addressbook", () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock("fs-extra", () => mockFsExtra())
    Addressbook = require("src/main/addressbook.js")

    jest.mock("axios", () => ({
      get: async endpoint => {
        if (endpoint.endsWith("/status")) {
          return {
            data: {
              result: {
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
              }
            }
          }
        } else if (endpoint.endsWith("/net_info")) {
          return {
            data: {
              result: {
                peers: [
                  {
                    node_info: {
                      listen_addr: "323.456.123.456",
                      other: [
                        "amino_version=0.9.8",
                        "p2p_version=0.5.0",
                        "consensus_version=v1/0.2.2",
                        "rpc_version=0.7.0/3",
                        "tx_index=on",
                        "rpc_addr=tcp://0.0.0.0:26657"
                      ]
                    }
                  },
                  {
                    node_info: {
                      listen_addr: "423.456.123.456",
                      other: [
                        "amino_version=0.9.8",
                        "p2p_version=0.5.0",
                        "consensus_version=v1/0.2.2",
                        "rpc_version=0.7.0/3",
                        "tx_index=off",
                        "rpc_addr=tcp://0.0.0.0:26657"
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }))
  })

  it("should store peristent peers", () => {
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456"]
    })
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
  })

  it("should restore saved peers", () => {
    let fs = require("fs-extra")
    fs.writeFileSync(
      "./config/addressbook.json",
      JSON.stringify(["123.456.123.456"])
    )
    let addressbook = new Addressbook(mockConfig, "./config")
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
  })

  it("should save initial peers to disc", () => {
    let fs = require("fs-extra")
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456"]
    })
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
    let content = fs.readFileSync("./addressbook.json")
    expect(JSON.parse(content)).toEqual(["123.456.123.456"])
  })

  it("should return node", async () => {
    Addressbook = require("src/main/addressbook.js")
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456"]
    })
    let node = await addressbook.pickNode()
    expect(node).toMatchSnapshot()
  })

  it("should always return a specified node", async () => {
    process.env.COSMOS_NODE = "123.456.123.456"
    try {
      jest.resetModules()
      Addressbook = require("src/main/addressbook.js")
      let addressbook = new Addressbook(mockConfig, "./config")
      expect(await addressbook.pickNode()).toMatchSnapshot()
    } catch (err) {
      throw err
    } finally {
      delete process.env.COSMOS_NODE
    }
  })

  it("should cycle though nodes until it finds one that is available", async () => {
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456", "223.456.123.456"]
    })
    let node = await addressbook.pickNode()
    expect(node).toMatchSnapshot()
  })

  it("should throw an error if there are no nodes available", async done => {
    jest.doMock("axios", () => ({
      get: async () => {
        return Promise.reject()
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")

    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456", "223.456.123.456"]
    })
    await addressbook.pickNode().then(done.fail, err => {
      expect(err.message).toMatch("No nodes available to connect to")
      done()
    })
  })

  it("should query peers on connecting to a node", async () => {
    Addressbook = require("src/main/addressbook.js")
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456", "223.456.123.456"]
    })
    addressbook.discoverPeers = jest.fn()
    await addressbook.pickNode()
    expect(addressbook.discoverPeers).toHaveBeenCalled()
  })

  it("should query and store peers of connected node", async () => {
    Addressbook = require("src/main/addressbook.js")
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456", "223.456.123.456"]
    })
    await addressbook.discoverPeers("123.456.123.456")
    expect(addressbook.peers.map(p => p.host)).toContain("323.456.123.456")
    expect(addressbook.peers.map(p => p.host)).toContain("423.456.123.456")

    const fs = require("fs-extra")
    let content = fs.readFileSync("./addressbook.json")
    let storedNodes = JSON.parse(content)
    expect(storedNodes).toContain("323.456.123.456")
    expect(storedNodes).toContain("423.456.123.456")
  })

  it("should provide the ability to reset the state of the nodes to try to reconnect to all, i.e. after an internet outage", async done => {
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["123.456.123.456", "223.456.123.456"]
    })

    addressbook.peers = addressbook.peers.map(p => {
      p.state = "down"
      return p
    })

    await addressbook.pickNode().then(done.fail, err => {
      expect(err.message).toMatch("No nodes available to connect to")
    })

    addressbook.resetNodes()

    await addressbook.pickNode().then(() => done(), done.fail)
  })

  it("should allow http addresses as peer addresses", async () => {
    let addressbook = new Addressbook(mockConfig, "./", {
      persistent_peers: ["http://123.456.123.456"]
    })
    let node = await addressbook.pickNode()
    expect(node).toMatchSnapshot()
  })

  it("should call back on connection", async () => {
    let spy = jest.fn()
    let addressbook = new Addressbook(mockConfig, "./config", {
      persistent_peers: ["http://123.456.123.456"],
      onConnectionMessage: spy
    })
    await addressbook.pickNode()
    expect(spy).toHaveBeenCalled()
  })

  it("should flag nodes incompatible", async done => {
    let addressbook = new Addressbook(mockConfig, "./config", {
      persistent_peers: ["http://123.456.123.456"]
    })
    addressbook.flagNodeIncompatible("123.456.123.456")
    await addressbook
      .pickNode()
      .then(done.fail)
      .catch(() => done())
  })
})
