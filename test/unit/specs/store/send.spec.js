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
      await store.commit("setAccountNumber", 123)
      store.dispatch("setLastHeader", {
        height: 5,
        chain_id: "test-chain"
      })
    })

    it("should send from wallet", async () => {
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      await store.dispatch("sendTx", args)
      expect(node.send.mock.calls).toMatchSnapshot()
    })

    it("should fail sending a wallet tx", async done => {
      node.send = () => Promise.reject()
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
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
      let args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      let error1
      try {
        await store.dispatch("sendTx", args)
      } catch (err) {
        error1 = err
      }
      expect(error1).toBeDefined()

      node.send = send
      args = { to: "mock_address", amount: [{ denom: "mycoin", amount: 123 }] }
      let error2
      try {
        await store.dispatch("sendTx", args)
      } catch (err) {
        error2 = err
      }
      expect(error2).toBeUndefined()
    })

    it("should wait for currently sending tx to be sent", async () => {
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      node.send = async () => ({
        check_tx: { code: 0 },
        deliver_tx: { code: 0 }
      })
      store.dispatch("sendTx", Object.assign({}, args))
      await store.dispatch("sendTx", Object.assign({}, args))
    })

    it("should query the wallet state after sending", async done => {
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      node.queryAccount = () => done()
      await store.dispatch("sendTx", args)
    })

    it("should signal check tx failure", async done => {
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      node.send = async () => ({
        check_tx: { code: 1 },
        deliver_tx: { code: 0 }
      })
      await store.dispatch("sendTx", args).catch(() => done())
    })

    it("should signal deliver tx failure", async done => {
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      node.send = async () => ({
        check_tx: { code: 0 },
        deliver_tx: { code: 1 }
      })
      await store.dispatch("sendTx", args).catch(() => done())
    })

    it("should handle tx failure in multiple tx result", async done => {
      const args = {
        to: "mock_address",
        amount: [{ denom: "mycoin", amount: 123 }]
      }
      node.send = async () => [
        {
          check_tx: { code: 0 },
          deliver_tx: { code: 0 }
        },
        {
          check_tx: { code: 0 },
          deliver_tx: { code: 1 }
        }
      ]
      await store.dispatch("sendTx", args).catch(() => done())
    })
  })
})
