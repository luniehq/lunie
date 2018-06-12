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

    it("should send a transaction after failing", async () => {
      let send = node.send.bind(node)

      node.send = () => Promise.reject(true)
      let args = { to: "address", amount: [{ denom: "mycoin", amount: 123 }] }
      let error1
      try {
        await store.dispatch("sendTx", args)
      } catch (err) {
        error1 = err
      }
      expect(error1).toBeDefined()

      node.send = send
      args = { to: "address", amount: [{ denom: "mycoin", amount: 123 }] }
      let error2
      try {
        await store.dispatch("sendTx", args)
      } catch (err) {
        error2 = err
      }
      expect(error2).toBeUndefined()
    })
  })
})
