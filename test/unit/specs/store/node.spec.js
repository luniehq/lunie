import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Node", () => {
  let store, node

  beforeEach(() => {
    jest.resetModules()
    let test = instance.shallow()
    store = test.store
    node = test.node

    node.rpcInfo.connected = true
    node.rpcReconnect = jest.fn(() => {
      node.rpcInfo.connected = true
      return Promise.resolve()
    })
  })

  jest.useFakeTimers()

  afterEach(() => {
    jest.runAllTimers()
  })

  it("sets the header", () => {
    store.dispatch("setLastHeader", {
      height: 5,
      chain_id: "test-chain"
    })
    expect(store.state.node.lastHeader.height).toBe(5)
    expect(store.state.node.lastHeader.chain_id).toBe("test-chain")
  })

  it("checks for new validators", done => {
    node.rpc.validators = () => done()
    store.dispatch("setLastHeader", {
      height: 5,
      chain_id: "test-chain",
      validators_hash: "1234567890123456789012345678901234567890"
    })
  })

  it("sets connection state", () => {
    expect(store.state.node.connected).toBe(false)
    store.commit("setConnected", true)
    expect(store.state.node.connected).toBe(true)
  })

  it("triggers a reconnect", () => {
    store.dispatch("reconnect")
    expect(node.rpcReconnect).toHaveBeenCalled()
  })

  it("subscribes again on reconnect", done => {
    node.rpc.status = () => done()
    store.dispatch("reconnected")
  })

  it("should not reconnect if stop reconnecting is set", () => {
    store.commit("stopConnecting", true)
    node.rpcReconnect = () => {
      throw Error("Should not reconnect")
    }
    store.dispatch("reconnect")
  })

  it("reacts to rpc disconnection with reconnect", done => {
    let failed = false
    node.rpcReconnect = () => {
      store.commit("stopConnecting", true)
      done()
    }
    node.rpc.on = jest.fn((value, cb) => {
      if (value === "error" && !failed) {
        failed = true
        cb({ message: "disconnected" })
        expect(store.state.node.connected).toBe(false)
      }
    })
    store.dispatch("rpcSubscribe")
  })

  it("should not reconnect on errors that do not mean disconnection", done => {
    node.rpcReconnect = () => {
      throw Error("Shouldnt reconnect")
    }
    node.rpc.on = jest.fn((value, cb) => {
      if (value === "error") {
        cb({ message: "some message" })
        expect(store.state.node.connected).toBe(true)
        done()
      }
    })
    store.dispatch("rpcSubscribe")
  })

  it("should set the initial status", () => {
    node.rpc.status = cb =>
      cb(null, {
        latest_block_height: 42,
        node_info: { network: "test-net" }
      })
    store.dispatch("rpcSubscribe")
    expect(store.state.node.connected).toBe(true)
    expect(store.state.node.lastHeader.height).toBe(42)
    expect(store.state.node.lastHeader.chain_id).toBe("test-net")
  })

  it("should react to failing status calls", () => {
    let spy = jest.spyOn(console, "error").mockImplementation(() => {})
    node.rpc.status = cb => cb({ message: "Expected" }, null)
    store.dispatch("rpcSubscribe")
    expect(spy).toHaveBeenCalledWith({
      message: "Expected"
    })
    spy.mockRestore()
  })

  it("should react to status updates", () => {
    node.rpc.subscribe = (type, cb) => {
      if (type.query === "tm.event = 'NewBlockHeader'") {
        cb(null, {
          data: {
            value: {
              header: {
                height: 43,
                chain_id: "test-net2",
                validators_hash: "abcd"
              }
            }
          }
        })
      }
    }
    store.dispatch("rpcSubscribe")
    expect(store.state.node.connected).toBe(true)
    expect(store.state.node.lastHeader.height).toBe(43)
    expect(store.state.node.lastHeader.chain_id).toBe("test-net2")
  })

  it("should react to status updates errors", () => {
    let spy = jest.spyOn(console, "error").mockImplementation(() => {})
    node.rpc.subscribe = (type, cb) => {
      if (type.query === "tm.event = 'NewBlockHeader'") {
        cb({ message: "Expected" }, null)
      }
    }
    store.dispatch("rpcSubscribe")
    expect(spy).toHaveBeenCalledWith("error subscribing to headers", {
      message: "Expected"
    })
    spy.mockRestore()
  })

  it("should check for an existing LCD connection", async () => {
    expect(await store.dispatch("checkConnection")).toBe(true)
    node.lcdConnected = () => Promise.reject()
    expect(await store.dispatch("checkConnection")).toBe(false)
    expect(store.state.notifications[0].body).toContain(`Couldn't initialize`)
  })

  it("should trigger reconnection if it started disconnected", done => {
    node.rpcInfo.connected = false
    node.rpcReconnect = () => {
      done()
      node.rpcInfo.connected = true
      return Promise.resolve("1.1.1.1")
    }
    store.dispatch("rpcSubscribe")
  })

  it("should ping the node to check connection status", done => {
    node.rpc.status = () => done()
    store.dispatch("pollRPCConnection")
    expect(store.state.node.nodeTimeout).toBeDefined()
  })

  it("should reconnect if pinging node timesout", done => {
    node.rpcReconnect = () => done()
    node.rpc.status = cb => {}
    store.dispatch("pollRPCConnection", 10)
  })

  it("should reconnect if pinging node fails", done => {
    node.rpcReconnect = () => {
      // restore status hook as it crashes the rest if not
      node.rpc.status = cb => {}
      done()
    }
    node.rpc.status = cb => cb("Error")
    store.dispatch("pollRPCConnection", 10)
  })

  it("should not reconnect if pinging node is successful", () => {
    node.rpc.status = cb => {
      store.commit("stopConnecting", true)
      cb(null, { node_info: {} })
    }
    node.rpcReconnect = () => {
      throw Error("Shouldnt reconnect")
    }
    store.dispatch("pollRPCConnection", 50)
  })

  it("should set approval required state", () => {
    store.commit("setNodeApprovalRequired", "abc")

    expect(store.state.node.approvalRequired).toBe("abc")
  })

  it("should send approval of node hash", () => {
    let { ipcRenderer } = require("electron")
    let spy = jest.spyOn(ipcRenderer, "send")

    store.dispatch("approveNodeHash", "abc")

    expect(spy).toHaveBeenCalledWith("hash-approved", "abc")
    expect(store.state.node.approvalRequired).toBe(null)
  })

  it("should send disapproval of node hash", () => {
    let { ipcRenderer } = require("electron")
    let spy = jest.spyOn(ipcRenderer, "send")

    store.dispatch("disapproveNodeHash", "abc")

    expect(spy).toHaveBeenCalledWith("hash-disapproved", "abc")
    expect(store.state.node.approvalRequired).toBe(null)
  })

  it("should switch to the mocked node implemenation", () => {
    let { ipcRenderer } = require("electron")
    let spy = jest.spyOn(node, "setup")

    store.dispatch("setMockedConnector", true)

    expect(spy).toHaveBeenCalledWith(true)
  })

  it("should stop the lcd if in mocked mode", () => {
    let { ipcRenderer } = require("electron")
    let spy = jest.spyOn(ipcRenderer, "send")

    store.dispatch("setMockedConnector", true)

    expect(spy).toHaveBeenCalledWith("stop-lcd")
  })

  it("should log the user out if switched to live mode", () => {
    store.dispatch("setMockedConnector", true)
    store.dispatch("setMockedConnector", false)

    expect(store.state.config.modals.session.state).toBe("loading")
    expect(store.state.user.signedIn).toBe(false)
  })
})
