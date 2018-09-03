import Store from "renderer/vuex/store"
import node from "../../helpers/node_mock"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe("Store", () => {
  let store

  beforeEach(() => {
    node.queryAccount = () => new Promise(() => {}) // make balances not return
    node.txs = () => new Promise(() => {}) // make txs not return
    store = Store({ node })
    localStorage.setItem(
      "store_test-net_" + lcdClientMock.addresses[0],
      undefined
    )
  })

  // DEFAULT

  it("should persist balances et al if the user is logged in", async () => {
    jest.useFakeTimers()
    await store.dispatch("setLastHeader", {
      height: 42,
      chain_id: "test-net"
    })
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setWalletBalances", [{ denom: "fabocoin", amount: 42 }])
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    expect(
      localStorage.getItem("store_test-net_" + lcdClientMock.addresses[0])
    ).toBeTruthy()
  })

  it("should restore balances et al after logging in", async () => {
    jest.useFakeTimers()
    await store.dispatch("setLastHeader", {
      height: 42,
      chain_id: "test-net"
    })
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setWalletBalances", [{ denom: "fabocoin", amount: 42 }])
    store.commit("setWalletHistory", [{}])
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    await store.dispatch("signOut")
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })

    expect(store.state.wallet.balances).toHaveLength(1)
    expect(store.state.wallet.history).toHaveLength(1)
  })

  it("should restore delegates and put commited once in the cart", async () => {
    jest.useFakeTimers()
    await store.dispatch("setLastHeader", {
      height: 42,
      chain_id: "test-net"
    })
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setDelegates", lcdClientMock.state.candidates)
    store.commit("setCommittedDelegation", {
      candidateId: lcdClientMock.state.candidates[0].owner,
      value: 1
    })
    jest.runAllTimers() // updating is waiting if more updates coming in, this skips the waiting
    await store.dispatch("signOut")
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })

    expect(store.state.delegates.delegates).toHaveLength(3)
    expect(
      store.state.delegation.committedDelegates[
        lcdClientMock.state.candidates[0].owner
      ]
    ).toBe(1)
  })

  it("should throttle updating the store cache", async () => {
    jest.useFakeTimers()
    await store.dispatch("setLastHeader", {
      height: 42,
      chain_id: "test-net"
    })
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setWalletBalances", [{ denom: "fabocoin", amount: 42 }])

    // not updating yet, as it waits if there are more updates incoming
    expect(
      localStorage.getItem("store_test-net_" + lcdClientMock.addresses[0])
    ).toBeFalsy()

    store.commit("setWalletHistory", [{}])
    jest.runAllTimers()

    expect(
      localStorage.getItem("store_test-net_" + lcdClientMock.addresses[0])
    ).toBeTruthy()
  })
})
