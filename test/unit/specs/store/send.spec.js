import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let instance = setup()

describe(`Module: Send`, () => {
  let store, node

  let errMsgWithObject = {
    response: {
      data: `Msg 0 failed: {"codespace":4,"code":102,"abci_code":262246,"message":"existing unbonding delegation found"}`
    }
  }

  let errObject = {
    response: {
      data: {
        codespace: 4,
        code: 102,
        abci_code: 262246,
        message: `invalid sequence`
      }
    }
  }

  let errMsgNoObject = {
    response: {
      data: `unexpected error`
    }
  }

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node

    store.commit(`setConnected`, true)
  })

  // DEFAULT

  it(`should have an empty state by default`, () => {
    const state = { nonce: `0` }
    expect(store.state.send).toEqual(state)
  })

  // MUTATIONS

  it(`should set wallet nonce`, () => {
    const nonce = 959
    store.commit(`setNonce`, nonce)
    expect(store.state.send.nonce).toBe(nonce)
  })

  // ACTIONS

  describe(`send transactions`, () => {
    beforeEach(async () => {
      let account = `default`
      let password = `1234567890`
      node.send = jest.fn(node.send)
      await store.dispatch(`signIn`, { account, password })
      store.dispatch(`setLastHeader`, {
        height: 5,
        chain_id: `test-chain`
      })
    })

    it(`should send from wallet`, async () => {
      const args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      await store.dispatch(`sendTx`, args)
      expect(node.send.mock.calls).toMatchSnapshot()
    })

    describe(`should fail sending a tx`, () => {
      it(`if the data has an object in message`, async () => {
        node.updateDelegations = () => Promise.reject(errMsgWithObject)
        const args = {
          type: `updateDelegations`,
          to: lcdClientMock.addresses[0],
          password: `1234567890`,
          delegations: [],
          begin_unbondings: [],
          begin_redelegates: [
            {
              shares: 10,
              validator_addr: lcdClientMock.validators[0],
              delegator_addr: lcdClientMock.addresses[0]
            }
          ]
        }
        await store.dispatch(`sendTx`, args).catch(err => {
          expect(err.message).toEqual(`existing unbonding delegation found`)
        })
      })

      it(`if the data has a string in 'message'`, async () => {
        node.send = () => Promise.reject(errMsgNoObject)
        const args = {
          to: `mock_address`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        await store.dispatch(`sendTx`, args).catch(err => {
          expect(err.message).toEqual(`unexpected error`)
        })
      })

      it(`if the data is an object and has a 'message' property`, async () => {
        node.send = () => Promise.reject(errObject)
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        await store.dispatch(`sendTx`, args).catch(err => {
          expect(err.message).toEqual(`invalid sequence`)
        })
      })

      it(`should signal check tx failure`, async done => {
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        node.send = async () => ({
          check_tx: { code: 1 },
          deliver_tx: { code: 0 }
        })
        await store.dispatch(`sendTx`, args).catch(() => done())
      })

      it(`should signal deliver tx failure`, async done => {
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        node.send = async () => ({
          check_tx: { code: 0 },
          deliver_tx: { code: 1 }
        })
        await store.dispatch(`sendTx`, args).catch(() => done())
      })

      it(`should handle tx failure in multiple tx result`, async done => {
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
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
        await store.dispatch(`sendTx`, args).catch(() => done())
      })
    })

    it(`should send a transaction after failing`, async () => {
      let send = node.send.bind(node)

      node.send = () => Promise.reject(true)
      let args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      let error1
      try {
        await store.dispatch(`sendTx`, args)
      } catch (error) {
        error1 = error
      }
      expect(error1).toBeDefined()

      node.send = send
      args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      let error2
      try {
        await store.dispatch(`sendTx`, args)
      } catch (error) {
        error2 = error
      }
      expect(error2).toBeUndefined()
    })

    it(`should wait for currently sending tx to be sent`, async () => {
      const args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      node.send = async () => ({
        check_tx: { code: 0 },
        deliver_tx: { code: 0 }
      })
      store.dispatch(`sendTx`, Object.assign({}, args))
      await store.dispatch(`sendTx`, Object.assign({}, args))
    })

    it(`should query the wallet state after sending`, async done => {
      const args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      node.queryAccount = () => done()
      await store.dispatch(`sendTx`, args)
    })

    it(`should throw an error if not connected`, async () => {
      let args = {
        to: `mock_address`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      store.state.connection.connected = false
      let error2
      try {
        await store.dispatch(`sendTx`, args)
      } catch (error) {
        error2 = error
      }
      expect(error2).toBeDefined()
    })
  })
})
