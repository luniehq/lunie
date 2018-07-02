const mockFsExtra = require("../helpers/fs-mock").default
let Addressbook

const VERSION = "0.12.1"

describe("Addressbook", () => {
  beforeEach(() => {
    jest.resetModules()
    jest.mock("fs-extra", () => mockFsExtra())
    Addressbook = require("src/main/addressbook.js")
  })

  it("should store peristent peers", () => {
    let addressbook = new Addressbook("./", VERSION, ["123.456.123.456"])
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
  })

  it("should restore saved peers", () => {
    let fs = require("fs-extra")
    fs.writeFileSync(
      "./config/addressbook.json",
      JSON.stringify(["123.456.123.456"])
    )
    let addressbook = new Addressbook("./config", VERSION)
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
  })

  it("should save initial peers to disc", () => {
    let fs = require("fs-extra")
    let addressbook = new Addressbook("./config", VERSION, ["123.456.123.456"])
    expect(addressbook.peers.map(p => p.host)).toContain("123.456.123.456")
    let content = fs.readFileSync("./config/addressbook.json")
    expect(JSON.parse(content)).toEqual(["123.456.123.456"])
  })

  it("should return node", async () => {
    jest.doMock("axios", () => ({
      get: async url => {
        if (url.indexOf("node_version") !== -1) {
          return { data: VERSION }
        }
        return { data: { result: { peers: [] } } }
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")

    let addressbook = new Addressbook("./config", VERSION, ["123.456.123.456"])
    let node = await addressbook.pickNode()
    expect(node).toBe("123.456.123.456:46657")
  })

  it("should always return a specified node", async () => {
    process.env.COSMOS_NODE = "123.456.123.456"
    try {
      jest.resetModules()
      Addressbook = require("src/main/addressbook.js")
      let addressbook = new Addressbook("./config", VERSION)

      expect(await addressbook.pickNode()).toBe("123.456.123.456:46657")
    } catch (err) {
      throw err
    } finally {
      delete process.env.COSMOS_NODE
    }
  })

  it("should cycle though nodes until it finds one that is available", async () => {
    jest.doMock("axios", () => ({
      get: async url => {
        if (url.indexOf("node_version") !== -1) {
          return { data: VERSION }
        }
        if (url.indexOf("123.456.123.456") !== -1) return Promise.reject()
        return Promise.resolve({
          data: { result: { peers: [] } }
        })
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")

    let addressbook = new Addressbook("./config", VERSION, [
      "123.456.123.456",
      "223.456.123.456"
    ])
    let node = await addressbook.pickNode()
    expect(node).toBe("223.456.123.456:46657")
  })

  it("should throw an error if there are no nodes available", async done => {
    jest.doMock("axios", () => ({
      get: async url => {
        return Promise.reject()
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")

    let addressbook = new Addressbook("./config", VERSION, [
      "123.456.123.456",
      "223.456.123.456"
    ])
    await addressbook.pickNode().then(done.fail, err => {
      expect(err.message).toMatch("No nodes available to connect to")
      done()
    })
  })

  it("should query peers on connecting to a node", async () => {
    jest.doMock("axios", () => ({
      get: async url => {
        if (url.indexOf("node_version") !== -1) {
          return { data: "0.12.1" }
        }
        return { data: { result: { peers: [] } } }
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")
    let addressbook = new Addressbook("./config", VERSION, [
      "123.456.123.456",
      "223.456.123.456"
    ])
    addressbook.discoverPeers = jest.fn()
    await addressbook.pickNode()
    expect(addressbook.discoverPeers).toHaveBeenCalled()
  })

  it("should query and store peers of connected node", async () => {
    jest.doMock("axios", () => ({
      get: async url => {
        if (url.indexOf("node_version") !== -1) {
          return { data: VERSION }
        }
        return {
          data: {
            result: {
              peers: [
                {
                  node_info: {
                    listen_addr: "323.456.123.456"
                  }
                },
                {
                  node_info: {
                    listen_addr: "423.456.123.456"
                  }
                }
              ]
            }
          }
        }
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")

    let addressbook = new Addressbook("./config", VERSION, [
      "123.456.123.456",
      "223.456.123.456"
    ])
    await addressbook.discoverPeers("123.456.123.456")
    expect(addressbook.peers.map(p => p.host)).toContain("323.456.123.456")
    expect(addressbook.peers.map(p => p.host)).toContain("423.456.123.456")

    const fs = require("fs-extra")
    let content = fs.readFileSync("./config/addressbook.json")
    let storedNodes = JSON.parse(content)
    expect(storedNodes).toContain("323.456.123.456")
    expect(storedNodes).toContain("423.456.123.456")
  })

  it("should provide the ability to reset the state of the nodes to try to reconnect to all, i.e. after an internet outage", async done => {
    let addressbook = new Addressbook("./config", VERSION, [
      "123.456.123.456",
      "223.456.123.456"
    ])

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
    let addressbook = new Addressbook("./config", VERSION, [
      "http://123.456.123.456"
    ])
    let node = await addressbook.pickNode()
    expect(node).toBe("123.456.123.456:46657")
  })

  it("should pick nodes with the correct version", async () => {
    jest.doMock("axios", () => ({
      get: async url => {
        if (url.indexOf("node_version") !== -1) {
          if (url.indexOf("123.456.123.456") !== -1) return { data: "0.13.1" }
          if (url.indexOf("223.456.123.456") !== -1) return { data: VERSION }
        }
        return { data: { result: { peers: [] } } }
      }
    }))
    jest.resetModules()
    Addressbook = require("src/main/addressbook.js")
    let addressbook = new Addressbook("./config", VERSION, [
      "123.456.123.456",
      "223.456.123.456"
    ])
    let node = await addressbook.pickNode()
    expect(node).toBe("223.456.123.456:46657")
  })
})
