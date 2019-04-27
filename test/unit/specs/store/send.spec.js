import sendModule from "modules/send.js"
import lcdClientMock from "src/connectors/lcdClientMock.js"

jest.mock(`scripts/keystore.js`, () => ({
  getKey: () => ({
    cosmosAddress: `cosmos1r5v5srda7xfth3hn2s26txvrcrntldjumt8mhl`,
    privateKey: `8088c2ed2149c34f6d6533b774da4e1692eb5cb426fdbaef6898eeda489630b7`,
    publicKey: `02ba66a84cf7839af172a13e7fc9f5e7008cb8bca1585f8f3bafb3039eda3c1fdd`
  })
}))

jest.mock(`src/config.js`, () => ({
  default_gas: 42
}))

jest.mock(`scripts/wallet.js`, () => ({
  sign: jest.fn(() => []),
  createBroadcastBody: jest.fn(() => ({
    broadcast: `body`
  })),
  createSignedTx: jest.fn(() => { }),
  createSignMessage: jest.fn(() => { })
}))

const mockRootState = {
  session: {
    account: `default`,
    gasPrice: 2.5e-8,
    gasAdjustment: 1.5
  },
  wallet: {
    accountNumber: `12`,
    address: `cosmos1demo`
  },
  connection: {
    connected: true,
    lastHeader: {
      chain_id: `mock-chain`
    }
  },
  ledger: { isConnected: false },
  stakingParameters: { parameters: { bond_denom: `uatom` } }
}

describe(`Module: Send`, () => {
  let module, state, actions, mutations, node

  const errMsgWithObject = {
    response: {
      data: `Msg 0 failed: {"codespace":4,"code":102,"abci_code":262246,"message":"existing unbonding delegation found"}`
    }
  }

  const errObject = {
    response: {
      data: {
        codespace: 4,
        code: 102,
        abci_code: 262246,
        message: `invalid sequence`
      }
    }
  }

  const errMsgNoObject = {
    response: {
      data: `unexpected error`
    }
  }

  const gas = String(Math.floor(1234567 * 1.5))
  const gas_prices = [
    {
      amount: `0.025`, // recommended on Cosmos Docs
      denom: `uatom` //TODO: this shouldn't be hardcoded
    }
  ]

  beforeEach(() => {
    node = {
      send: jest.fn(async (...args) => {
        const req = args[args.length - 1]
        const simulate = req && req.base_req && req.base_req.simulate
        if (simulate) {
          return Promise.resolve({ gas_estimate: `123123` })
        } else {
          return Promise.resolve({ msg: {} })
        }
      }),
      postTx: jest.fn(() => Promise.resolve({
        height: `1`,
        txhash: `h`
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

  describe(`Mutations`, () => {
    it(`should set wallet nonce`, () => {
      const nonce = 959
      mutations.setNonce(state, nonce)
      expect(state.nonce).toBe(nonce)
    })

    it(`should prevent from downgrading a wallet nonce`, () => {
      state.nonce = 959
      mutations.setNonce(state, 1)
      expect(state.nonce).toBe(959)
    })
  })

  describe(`Actions`, () => {
    it(`should reset the nonce if session was changed`, () => {
      state.nonce = 959
      actions.resetSessionData({ state })
      expect(state.nonce).toBe(`0`)
    })

    describe(`simulate transactions`, () => {
      describe(`succeeds`, () => {
        it(`if node is connected`, async () => {
          const self = {
            state,
            dispatch: jest.fn(),
            rootState: mockRootState
          }
          const args = {
            type: `send`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          const estimate = await actions.simulateTx(self, args)
          expect(estimate).toBe(123123)
        })
      })

      describe(`fails`, () => {
        it(`when there's no connection`, async () => {
          const self = {
            state,
            dispatch: jest.fn(),
            rootState: JSON.parse(JSON.stringify(mockRootState))
          }
          const args = {
            type: `send`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          self.rootState.connection.connected = false
          try {
            await actions.simulateTx(self, args)
          } catch ({ message }) {
            expect(message).toBe(
              `Currently not connected to a secure node. Please try again when Voyager has secured a connection.`
            )
          }
        })
      })
    })

    describe(`send transactions`, () => {
      describe(`succeeds`, () => {
        describe(`signing with local keystore`, () => {
          it(`should send`, async () => {
            const args = {
              type: `send`,
              password: `1234567890`,
              amount: [{ denom: `uatom`, amount: 123 }],
              gas: `1234567`,
              gas_prices,
              submitType: `local`
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
            expect(node.send).toHaveBeenCalledWith({
              amount: [{ amount: 123, denom: `uatom` }],
              password: `1234567890`,
              base_req: {
                account_number: `12`,
                chain_id: `mock-chain`,
                from: `cosmos1demo`,
                gas,
                sequence: `0`,
                memo: `Sent via Lunie`,
                gas_prices,
                simulate: false
              }
            })
            expect(node.postTx).toHaveBeenCalledWith({
              broadcast: `body`
            })
          })

          it(`should send using a to parameter`, async () => {
            const args = {
              type: `send`,
              to: `mock_address`,
              password: `1234567890`,
              gas: `1234567`,
              gas_prices,
              amount: [{ denom: `uatom`, amount: 123 }],
              submitType: `local`
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

            expect(node.send).toHaveBeenCalledWith(`mock_address`,
              {
                amount: [{ amount: 123, denom: `uatom` }],
                password: `1234567890`,
                base_req: {
                  account_number: `12`,
                  chain_id: `mock-chain`,
                  from: `cosmos1demo`,
                  gas,
                  sequence: `0`,
                  memo: `Sent via Lunie`,
                  gas_prices,
                  simulate: false
                }
              })
            expect(node.postTx).toHaveBeenCalledWith({
              broadcast: `body`
            })
          })

          it(`should send using a 'to' and a 'pathParameter'`, async () => {
            const args = {
              type: `send`,
              to: `mock_address`,
              pathParameter: `cosmosvaloper1address`,
              password: `1234567890`,
              gas: `1234567`,
              gas_prices,
              amount: [{ denom: `uatom`, amount: 123 }],
              submitType: `local`
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

            expect(node.send).toHaveBeenCalledWith(`mock_address`, `cosmosvaloper1address`, {
              amount: [{ amount: 123, denom: `uatom` }],
              password: `1234567890`,
              base_req: {
                account_number: `12`,
                chain_id: `mock-chain`,
                from: `cosmos1demo`,
                gas,
                sequence: `0`,
                memo: `Sent via Lunie`,
                gas_prices,
                simulate: false
              }
            })
            expect(node.postTx).toHaveBeenCalledWith({
              broadcast: `body`
            })
          })
        })

        describe(`signing with Ledger Nano S`, () => {
          it(`should send`, async () => {
            const args = {
              type: `send`,
              password: `1234567890`,
              amount: [{ denom: `uatom`, amount: 123 }],
              submitType: `ledger`,
              gas: `1234567`,
              gas_prices: [{ denom: `uatom`, amount: `0.025` }]
            }
            state.externals = {
              createSignMessage: jest.fn(),
              signatureImport: jest.fn(),
              createSignature: jest.fn(),
              createSignedTx: jest.fn(),
              createBroadcastBody: jest.fn(() => ({ broadcast: `body` })),
              config: { default_gas: `500000` }
            }

            await actions.sendTx(
              {
                state,
                dispatch: jest.fn(),
                commit: jest.fn(),
                rootState: { ...mockRootState, ledger: { isConnected: true } }
              },
              args
            )

            expect(node.send).toHaveBeenCalledWith({
              amount: [{ amount: 123, denom: `uatom` }],
              password: `1234567890`,
              base_req: {
                account_number: `12`,
                chain_id: `mock-chain`,
                from: `cosmos1demo`,
                gas,
                sequence: `0`,
                memo: `Sent via Lunie`,
                gas_prices,
                simulate: false
              }
            })
            expect(node.postTx).toHaveBeenCalledWith({
              broadcast: `body`
            })
          })
        })
      })

      describe(`fails`, () => {
        it(`if the data has an object in message`, async () => {
          node.updateDelegations = jest.fn(() =>
            Promise.reject(errMsgWithObject.response.data)
          )
          const args = {
            type: `updateDelegations`,
            to: lcdClientMock.addresses[0],
            password: `1234567890`,
            delegations: [],
            begin_unbondings: [],
            begin_redelegates: [
              {
                shares: 10,
                validator_address: lcdClientMock.validators[0],
                delegator_address: lcdClientMock.addresses[0]
              }
            ]
          }
          await expect(
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
          node.postTx = () => Promise.reject(errMsgNoObject.response.data)
          const args = {
            to: `mock_address`,
            type: `send`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          await expect(
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
          node.postTx = () => Promise.reject(errObject.response.data)
          const args = {
            type: `send`,
            to: `mock_address`,
            password: `1234567890`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          await expect(
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
            type: `send`,
            to: `mock_address`,
            password: `1234567890`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          node.postTx = async () => ({
            check_tx: { code: 1 },
            deliver_tx: { code: 0 }
          })
          await expect(
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
            type: `send`,
            to: `mock_address`,
            password: `1234567890`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          node.postTx = async () => ({
            check_tx: { code: 0 },
            deliver_tx: { code: 1 }
          })
          await expect(
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
            type: `send`,
            to: `mock_address`,
            password: `1234567890`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          node.postTx = async () => [
            {
              check_tx: { code: 0 },
              deliver_tx: { code: 0 }
            },
            {
              check_tx: { code: 0 },
              deliver_tx: { code: 1 }
            }
          ]
          await expect(
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

        it(`when ledger returns a connection error`, async () => {
          const args = {
            type: `send`,
            password: `1234567890`,
            amount: [{ denom: `uatom`, amount: 123 }],
            submitType: `ledger`
          }
          const dispatch = jest.fn(async () =>
            Promise.reject(new Error(`No Ledger found`))
          )
          state.externals = {
            createSignMessage: jest.fn(),
            signatureImport: jest.fn(),
            createSignature: jest.fn(),
            createSignedTx: jest.fn(),
            createBroadcastBody: jest.fn(() => ({ broadcast: `body` })),
            config: { default_gas: `500000` }
          }
          await expect(
            actions.sendTx(
              {
                state,
                dispatch,
                commit: jest.fn(),
                rootState: { ...mockRootState, ledger: { isConnected: true } }
              },
              args
            )
          ).rejects.toThrowError(`No Ledger found`)
          expect(state.externals.createSignMessage).not.toHaveBeenCalled()
          expect(state.externals.signatureImport).not.toHaveBeenCalled()
          expect(state.externals.createSignature).not.toHaveBeenCalled()
          expect(state.externals.createSignedTx).not.toHaveBeenCalled()
          expect(state.externals.createBroadcastBody).not.toHaveBeenCalled()
        })
      })

      it(`should interpret a returned empty array as failed delivery`, async () => {
        const args = {
          type: `send`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
        }
        node.postTx = async () => []
        await expect(
          actions.sendTx(
            {
              state,
              dispatch: jest.fn(),
              commit: jest.fn(),
              rootState: mockRootState
            },
            args
          )
        ).rejects.toEqual(new Error(`Error sending transaction`))
      })

      it(`should handle txs not being integrated into a block right away`, async () => {
        const args = {
          type: `send`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
        }
        node.postTx = async () => ({
          height: `0`,
          txhash: `acbdefghi`
        })
        actions.signTx = () => ``
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

        expect(dispatch).toHaveBeenCalledWith(`queryTxInclusion`, `acbdefghi`)
      })

      it(`should handle failed checkTx on sync tx posting`, async () => {
        const args = {
          type: `send`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
        }
        node.postTx = async () => ({
          code: `4`,
          height: `0`,
          txhash: `acbdefghi`
        })
        actions.signTx = () => ``
        const dispatch = jest.fn()
        await expect(actions.sendTx(
          {
            state,
            dispatch,
            commit: jest.fn(),
            rootState: mockRootState
          },
          args
        )).rejects.toEqual(new Error(`Error sending: unauthorized`))
      })

      it(`should poll txs block inclusion`, async () => {
        jest.useRealTimers()

        const node = {
          tx: jest.fn()
            .mockImplementationOnce(() => Promise.reject(new Error(`404`)))
            .mockImplementationOnce(() => Promise.resolve({}))
        }
        await actions.queryTxInclusion(
          {
            state: {
              txQueryIterations: 10,
              txQueryTimeout: 1,
              node
            }
          },
          `acbdefghi`
        )

        expect(node.tx).toHaveBeenCalledTimes(2)
        expect(node.tx).toHaveBeenCalledWith(`acbdefghi`)
      })

      it(`should throw an error if txs are not integrated in a block for a long time`, async () => {
        const node = {
          tx: jest.fn(() => Promise.reject(new Error(`404`)))
        }
        await expect(actions.queryTxInclusion(
          {
            state: {
              txQueryIterations: 1,
              txQueryTimeout: 0,
              node
            }
          },
          `acbdefghi`
        )).rejects.toEqual(new Error(`The transaction was still not included in a block. We can't say for certain it will be included in the future.`))

        expect(node.tx).toHaveBeenCalledTimes(1)
        expect(node.tx).toHaveBeenCalledWith(`acbdefghi`)
      })

      it(`should still send a transaction after failing to send another transaction`, async () => {
        const send = node.postTx.bind(node)

        node.postTx = () => Promise.reject(true)
        let args = {
          type: `send`,
          submitType: `local`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
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

        node.postTx = send
        args = {
          type: `send`,
          submitType: `local`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
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
          type: `send`,
          submitType: `local`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
        }
        const args2 = {
          type: `send`,
          submitType: `local`,
          to: `mock_address_2`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
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

      it(`should free the lock if sending a tx fails`, async () => {
        const args = {
          type: `send`,
          submitType: `local`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
        }
        const args2 = {
          type: `send`,
          submitType: `local`,
          to: `mock_address_2`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
        }
        const dispatch = jest
          .fn()
          .mockRejectedValueOnce(`Error`)
          .mockResolvedValueOnce({})

        await actions
          .queueTx(
            {
              dispatch,
              state
            },
            args
          )
          .catch(err => {
            expect(err).toEqual(`Error`)
          })
        await actions.queueTx(
          {
            dispatch,
            state
          },
          args2
        )
        expect(dispatch).toHaveBeenCalledTimes(2)
      })

      it(`should query the wallet state before sending to acquire nonce`, async () => {
        const args = {
          type: `send`,
          submitType: `local`,
          to: `mock_address`,
          password: `1234567890`,
          amount: [{ denom: `uatom`, amount: 123 }]
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
        const args = {
          type: `send`,
          to: `mock_address`,
          amount: [{ denom: `uatom`, amount: 123 }]
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
})
