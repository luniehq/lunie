import setup from "../../helpers/vuex-setup"

let instance = setup()

describe("Module: Send", () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node
  })

  // DEFAULT

  it("should have an empty state by default", () => {
    const state = { nonce: 0 }
    expect(store.state.send).toEqual(state)
  })

  // MUTATIONS

  it("should set wallet nonce", () => {
    const nonce = 959
    store.commit("setNonce", nonce)
    expect(store.state.send.nonce).toBe(nonce)
  })

  // ACTIONS

  describe("send transactions", () => {
    beforeEach(async () => {
      let account = "default"
      let password = "1234567890"
      node.send = jest.fn(node.send)
      node.ibcSend = jest.fn(node.ibcSend)
      await store.dispatch("signIn", { account, password })
    })

    it("should send from wallet", async () => {
      const args = { to: "address", amount: [{ denom: "mycoin", amount: 123 }] }
      await store.dispatch("sendTx", args)
      expect(node.send.mock.calls).toMatchSnapshot()
    })

    it("should fail sending a wallet tx", async done => {
      node.send = () => Promise.reject()
      const args = { to: "address", amount: [{ denom: "mycoin", amount: 123 }] }
      store.dispatch("sendTx", args).then(done.fail, () => done())
    })

    it("should send an IBC transaction", async () => {
      const args = {
        to: "zone/address",
        amount: [{ denom: "mycoin", amount: 123 }],
        type: "ibcSend"
      }
      await store.dispatch("sendTx", args)
      expect(node.ibcSend.mock.calls).toMatchSnapshot()
    })
  })
})
