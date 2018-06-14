import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Delegates", () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
    node = test.node
  })

  it("adds delegate to state", () => {
    store.commit("addDelegate", {
      owner: "foo",
      pool_shares: { amount: "10/1" }
    })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      owner: "foo",
      pool_shares: { amount: "10/1" },
      voting_power: 10
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("replaces existing delegate with same id", () => {
    store.commit("addDelegate", {
      owner: "foo",
      pool_shares: { amount: "12/1" },
      updated: true
    })
    expect(store.state.delegates.delegates[0]).toEqual({
      id: "foo",
      owner: "foo",
      pool_shares: { amount: "12/1" },
      updated: true,
      voting_power: 12
    })
    expect(store.state.delegates.delegates.length).toBe(1)
  })

  it("fetches all candidates", async () => {
    await store.dispatch("getDelegates")
    let lcdClientMock = require("renderer/connectors/lcdClientMock.js")
    expect(store.state.delegates.delegates.map(x => x.owner)).toEqual(
      lcdClientMock.validators
    )
  })

  it("should query for delegates on reconnection", () => {
    jest.resetModules()
    let axios = require("axios")
    store.state.node.stopConnecting = true
    store.state.delegates.loading = true
    jest.spyOn(axios, "get")
    store.dispatch("reconnected")
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it("should not query for delegates on reconnection if not stuck in loading", () => {
    jest.resetModules()
    let axios = require("axios")
    store.state.node.stopConnecting = true
    store.state.delegates.loading = false
    jest.spyOn(axios, "get")
    store.dispatch("reconnected")
    expect(axios.get.mock.calls.length).toBe(0)
  })
})
