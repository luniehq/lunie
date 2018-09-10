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
    await store.dispatch("getBondedDelegates", store.state.delegates.delegates)
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

  it("submits undelegation transaction", async () => {
    store.dispatch("setLastHeader", {
      height: 42,
      chain_id: "test-chain"
    })
    await store.dispatch("getBondedDelegates")

    jest.spyOn(store._actions.sendTx, "0")

    let bondings = [50, 100, 0]
    const delegations = store.state.delegates.delegates.map((delegate, i) => ({
      delegate,
      atoms: bondings[i]
    }))

    await store.dispatch("submitDelegation", delegations)

    expect(store._actions.sendTx[0].mock.calls).toMatchSnapshot()
  })

  it("fetches current undelegations", async () => {
    await store.dispatch("getBondedDelegates", store.state.delegates.delegates)
    expect(store.state.delegation.unbondingDelegations).toMatchSnapshot()
  })

  it("deletes undelegations that are 0", async () => {
    await store.dispatch("getBondedDelegates", store.state.delegates.delegates)
    store.commit("setUnbondingDelegations", {
      candidateId: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
      value: 0
    })
    expect(
      store.state.delegation.unbondingDelegations
        .cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw
    ).toBeUndefined()
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

  it("updating delegations should not update another users state after signing out and in again", async () => {
    jest.resetModules()
    let resolveDelegationRequest

    // mock returning some delegations
    node.getDelegator = () =>
      new Promise(resolve => {
        resolveDelegationRequest = () =>
          resolve({
            delegations: [
              {
                delegator_addr: "abc",
                validator_addr: "def",
                shares: "14",
                height: 123
              }
            ]
          })
      })

    // trigger the get call
    let getDelegationsPromise = store.dispatch(
      "getBondedDelegates",
      store.state.delegates.delegates
    )

    // sign out - sign in
    store.state.user.address = "some other address"

    // finish the request
    resolveDelegationRequest()
    await getDelegationsPromise

    // expect the delegations to not be updated, as the address changed
    expect(Object.keys(store.state.delegation.committedDelegates)).toHaveLength(
      0
    )
  })
})
