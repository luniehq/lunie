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
    expect(store.state.delegates.delegates[0].owner).toBe(
      "70705055A9FA5901735D0C3F0954501DDE667327"
    )
    expect(store.state.delegates.delegates[1].owner).toBe(
      "760ACDE75EFC3DD0E4B2A6A3B96D91C05349EA31"
    )
    expect(store.state.delegates.delegates[2].owner).toBe(
      "77C26DF82654C5A5DDE5C6B7B27F3F06E9C223C0"
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
