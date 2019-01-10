import sendModule from "modules/send.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const mockRootState = {
  user: { account: `default` },
  wallet: {
    accountNumber: `12`
  },
  connection: {
    connected: true,
    lastHeader: {
      chain_id: `mock-chain`
    }
  }
}
describe(`Module: Send`, () => {
  let module, state, actions, mutations, node

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
    node = {
      send: jest.fn(() =>
        Promise.resolve({
          check_tx: { code: 0 },
          deliver_tx: { code: 0 }
        })
      )
    }
    module = sendModule({
      node
    })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  // DEFAULT

  it(`should have an empty state by default`, () => {
    const state = { nonce: `0` }
    expect(state).toEqual(state)
  })

  // MUTATIONS

  it(`should set wallet nonce`, () => {
    const nonce = 959
    mutations.setNonce(state, nonce)
    expect(state.nonce).toBe(nonce)
  })

  // ACTIONS

  describe(`send transactions`, () => {
    it(`should send from wallet`, async () => {
      const args = {
        type: `send`,
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      await actions.sendTx(
        {
          state,
          dispatch: jest.fn(),
          commit: jest.fn(),
          rootState: mockRootState
        },
        args
      )
      expect(node.send.mock.calls).toMatchSnapshot()
    })

    describe(`should fail sending a tx`, () => {
      it(`if the data has an object in message`, async () => {
        node.updateDelegations = jest.fn(() => Promise.reject(errMsgWithObject))
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
        expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error(`existing unbonding delegation found`))
      })

      it(`if the data has a string in 'message'`, async () => {
        node.send = () => Promise.reject(errMsgNoObject)
        const args = {
          to: `mock_address`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error(`unexpected error`))
      })

      it(`if the data is an object and has a 'message' property`, async () => {
        node.send = () => Promise.reject(errObject)
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error(`invalid sequence`))
      })

      it(`should signal check tx failure`, async () => {
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        node.send = async () => ({
          check_tx: { code: 1 },
          deliver_tx: { code: 0 }
        })
        expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error())
      })

      it(`should signal deliver tx failure`, async () => {
        const args = {
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `mycoin`, amount: 123 }]
        }
        node.send = async () => ({
          check_tx: { code: 0 },
          deliver_tx: { code: 1 }
        })
        expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error())
      })

      it(`should handle tx failure in multiple tx result`, async () => {
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
        expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error())
      })
    })

    it(`should still send a transaction after failing to send another transaction`, async () => {
      let send = node.send.bind(node)

      node.send = () => Promise.reject(true)
      let args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      let error1
      try {
        await actions.sendTx(
          {
            state,
            dispatch: jest.fn(),
            commit: jest.fn(),
            rootState: mockRootState
          },
          args
        )
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
        await actions.sendTx(
          {
            state,
            dispatch: jest.fn(),
            commit: jest.fn(),
            rootState: mockRootState
          },
          args
        )
      } catch (error) {
        error2 = error
      }
      expect(error2).toBeUndefined()
    })

    it(`should wait for currently sending tx to be sent`, async done => {
      jest.useFakeTimers()

      const args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      const args2 = {
        to: `mock_address_2`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      const dispatch = jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(
              () =>
                resolve({
                  check_tx: { code: 0 },
                  deliver_tx: { code: 0 }
                }),
              10000
            )
          })
      )
      actions
        .queueTx(
          {
            dispatch,
            state
          },
          args
        )
        .then(() => {
          jest.runAllTimers()
        })
      actions
        .queueTx(
          {
            dispatch,
            state
          },
          args2
        )
        .then(() => {
          expect(dispatch).toHaveBeenCalledTimes(2)
          expect(dispatch).toHaveBeenCalledWith(`sendTx`, args2)

          done()
        })
      expect(dispatch).toHaveBeenCalledTimes(1)
      expect(dispatch).toHaveBeenCalledWith(`sendTx`, args)

      jest.runAllTimers()
    })

    it(`should query the wallet state before sending to aquire nonce`, async () => {
      const args = {
        to: `mock_address`,
        password: `1234567890`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      const dispatch = jest.fn()
      await actions.sendTx(
        {
          state,
          dispatch,
          commit: jest.fn(),
          rootState: mockRootState
        },
        args
      )
      expect(dispatch).toHaveBeenCalledWith(`queryWalletBalances`)
    })

    it(`should throw an error if not connected`, async () => {
      let args = {
        to: `mock_address`,
        amount: [{ denom: `mycoin`, amount: 123 }]
      }
      expect(
        actions.sendTx(
          {
            state,
            dispatch: jest.fn(),
            commit: jest.fn(),
            rootState: Object.assign({}, mockRootState, {
              connection: {
                connected: false
              }
            })
          },
          args
        )
      ).rejects.toEqual(
        new Error(
          `Currently not connected to a secure node. Please try again when Voyager has secured a connection.`
        )
      )
    })
  })
})
