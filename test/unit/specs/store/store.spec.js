import Store from "renderer/vuex/store"
import node from "../../helpers/node_mock"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe("Store", () => {
  let store

  beforeEach(() => {
    node.queryAccount = () => new Promise(() => {}) // make balances not return
    node.txs = () => new Promise(() => {}) // make txs not return
    store = Store({ node })
  })

  // DEFAULT

  it("should persist balances et al if the user is logged in", async () => {
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setWalletBalances", [{ denom: "fabocoin", amount: 42 }])
    expect(
      localStorage.getItem("store_" + lcdClientMock.addresses[0])
    ).toBeTruthy()
  })

  it("should restore balances et al after logging in", async () => {
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })
    store.commit("setWalletBalances", [{ denom: "fabocoin", amount: 42 }])
    store.commit("setWalletHistory", [{}])
    await store.dispatch("signOut")
    await store.dispatch("signIn", {
      account: "default",
      password: "1234567890"
    })

    expect(store.state.wallet.balances).toHaveLength(1)
    expect(store.state.wallet.history).toHaveLength(1)
  })
})
