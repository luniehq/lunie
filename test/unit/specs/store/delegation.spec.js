import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Delegations", () => {
  let store, node

  beforeEach(async () => {
    let test = instance.shallow()
    store = test.store
    node = test.node

    store.dispatch("signIn", { password: "bar", account: "default" })
    await store.dispatch("getDelegates")
  })

  it("adds delegate to cart", () => {
    store.commit("addToCart", { id: "foo", x: 1 })
    expect(store.state.delegation.delegates[0]).toEqual({
      id: "foo",
      delegate: { id: "foo", x: 1 },
      atoms: 0
    })
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it("does not add delegate to cart if already exists", () => {
    store.commit("addToCart", { id: "foo" })
    store.commit("addToCart", { id: "foo", x: 1 })
    expect(store.state.delegation.delegates[0].id).toBe("foo")
    expect(store.state.delegation.delegates[0].x).toBe(undefined)
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it("removes delegate from cart", () => {
    store.commit("addToCart", { id: "foo" })
    store.commit("addToCart", { id: "bar" })
    store.commit("removeFromCart", "foo")
    expect(store.state.delegation.delegates[0]).toEqual({
      id: "bar",
      delegate: { id: "bar" },
      atoms: 0
    })
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it("sets atoms for delegate", () => {
    store.commit("addToCart", { id: "foo" })
    store.commit("setShares", { candidateId: "foo", value: 123 })
    expect(store.state.delegation.delegates[0].atoms).toBe(123)
  })

  it("sets committed atoms for delegate", () => {
    store.commit("addToCart", { id: "foo" })
    store.commit("setCommittedDelegation", { candidateId: "foo", value: 123 })
    expect(store.state.delegation.committedDelegates).toEqual({ foo: 123 })
  })

  it("sets committed atoms for delegate to 0", () => {
    store.commit("addToCart", { id: "foo" })
    store.commit("setCommittedDelegation", { candidateId: "foo", value: 123 })
    store.commit("setCommittedDelegation", { candidateId: "foo", value: 0 })
    expect(store.state.delegation.committedDelegates).toEqual({})
  })

  it("fetches bonded delegates", async () => {
    node.queryDelegation = jest
      .fn()
      .mockReturnValueOnce({
        shares: "10"
      })
      .mockReturnValueOnce({
        shares: "15"
      })
      // no delegation for a delegate
      .mockReturnValueOnce(null)

    await store.dispatch("getBondedDelegates", store.state.delegates.delegates)

    // each is user account + validator owner
    expect(node.queryDelegation.mock.calls).toEqual([
      [
        "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw"
      ],
      [
        "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au"
      ],
      [
        "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n"
      ]
    ])

    expect(store.state.delegation.committedDelegates).toMatchSnapshot()
  })

  it("submits delegation transaction", async () => {
    store.dispatch("setLastHeader", {
      height: 42,
      chain_id: "test-chain"
    })
    await store.dispatch("getBondedDelegates")

    jest.spyOn(store._actions.sendTx, "0")

    let bondings = [123, 456, 0]
    const delegations = store.state.delegates.delegates.map((delegate, i) => ({
      delegate,
      atoms: bondings[i]
    }))

    await store.dispatch("submitDelegation", delegations)

    expect(store._actions.sendTx[0].mock.calls).toMatchSnapshot()
  })

  it("should query delegated atoms on reconnection", () => {
    jest.resetModules()
    let axios = require("axios")
    store.state.node.stopConnecting = true
    store.state.delegation.loading = true
    jest.spyOn(axios, "get")
    store.dispatch("reconnected")
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it("should not query delegated atoms on reconnection if not stuck in loading", () => {
    jest.resetModules()
    let axios = require("axios")
    store.state.node.stopConnecting = true
    store.state.delegation.loading = false
    jest.spyOn(axios, "get")
    store.dispatch("reconnected")
    expect(axios.get.mock.calls.length).toBe(0)
  })
})
