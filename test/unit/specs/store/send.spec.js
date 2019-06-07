import sendModule, { getSigner } from "modules/send.js"

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
  createSignedTx: jest.fn(() => {}),
  createSignMessage: jest.fn(() => {})
}))

jest.mock(
  `@lunie/cosmos-js`,
  () =>
    class MockCosmosJs {
      constructor() {}

      MsgSend() {
        return {
          simulate: () => 123123,
          send: async () =>
            Promise.resolve({
              included: () => Promise.resolve()
            })
        }
      }
    }
)

const mockRootState = {
  session: {
    account: `default`,
    address: `cosmos1superaddress`
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
  let module, state, actions, node
  const gas_prices = [
    {
      amount: `0.025`, // recommended on Cosmos Docs
      denom: `uatom` //TODO: this shouldn't be hardcoded
    }
  ]

  beforeEach(() => {
    node = {
      url: "https://lunie.io",
      send: jest.fn(async (...args) => {
        const req = args[args.length - 1]
        const simulate = req && req.base_req && req.base_req.simulate
        if (simulate) {
          return Promise.resolve({ gas_estimate: `123123` })
        } else {
          return Promise.resolve({ msg: {} })
        }
      }),
      postTx: jest.fn(() =>
        Promise.resolve({
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
  })

  describe(`Actions`, () => {
    xdescribe(`simulate transactions`, () => {
      describe(`succeeds`, () => {
        it(`if node is connected`, async () => {
          const self = {
            state,
            dispatch: jest.fn(),
            rootState: mockRootState
          }
          const args = {
            type: `MsgSend`,
            txArguments: {
              toAddress: "cosmos1234",
              amounts: [{ denom: `uatom`, amount: 123 }]
            }
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
            type: `MsgSend`,
            amount: [{ denom: `uatom`, amount: 123 }]
          }
          self.rootState.connection.connected = false
          try {
            await actions.simulateTx(self, args)
          } catch ({ message }) {
            expect(message).toBe(
              `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
            )
          }
        })
      })
    })

    xdescribe("picke signer", () => {
      it("should pick a local signer", () => {
        state.externals.signWithPrivateKey = jest.fn(() => Buffer.alloc(0))
        state.externals.getKey = () => ({
          privateKey: Buffer.alloc(0),
          publicKey: Buffer.alloc(0)
        })
        const signer = getSigner(state, mockRootState, {
          submitType: "local",
          password: "1234567890"
        })
        expect(signer("message")).toEqual({
          signature: expect.any(Buffer),
          publicKey: expect.any(Buffer)
        })
        expect(state.externals.signWithPrivateKey).toHaveBeenCalledWith(
          "message",
          expect.any(Buffer)
        )
      })

      it("should pick a ledger signer", async () => {
        const ledgerMock = {
          getPubKey: jest.fn(() => Buffer.alloc(0)),
          sign: jest.fn(() => Buffer.alloc(0))
        }
        state.externals.Ledger = () => ledgerMock
        const signer = getSigner(state, mockRootState, { submitType: "ledger" })
        expect(await signer("message")).toEqual({
          signature: expect.any(Buffer),
          publicKey: expect.any(Buffer)
        })
        expect(ledgerMock.sign).toHaveBeenCalledWith("message")
      })
    })

    xdescribe(`send transactions`, () => {
      it(`should throw an error if not connected`, async () => {
        const args = {
          type: `MsgSend`,
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
            `Currently not connected to a secure node. Please try again when Lunie has secured a connection.`
          )
        )
      })

      it(`should send`, async () => {
        const args = {
          type: `MsgSend`,
          password: `1234567890`,
          txArguments: {
            toAddress: "cosmos1234",
            amounts: [{ denom: `uatom`, amount: 123 }]
          },
          gas: `1234567`,
          gas_prices,
          submitType: `local`
        }

        const sendSpy = jest.fn(() =>
          Promise.resolve({
            included: () => Promise.resolve()
          })
        )
        const messageSpy = jest.fn(() => ({
          simulate: () => 123123,
          send: sendSpy
        }))
        state.externals.Cosmos = class MockCosmosJs {
          constructor(...args) {
            expect(args).toEqual(["https://lunie.io", "mock-chain"])
            this.MsgSend = messageSpy
          }
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

        expect(messageSpy).toHaveBeenCalledWith("cosmos1superaddress", {
          amounts: [{ amount: 123, denom: "uatom" }],
          toAddress: "cosmos1234"
        })
        expect(sendSpy).toHaveBeenCalledWith(
          {
            gas: "1234567",
            gasPrices: [
              {
                amount: "0.025",
                denom: "uatom"
              }
            ],
            memo: undefined
          },
          expect.any(Function)
        )
      })

      it(`special treatment for withdrawels`, async () => {
        const args = {
          type: `MsgWithdrawDelegationReward`,
          password: `1234567890`,
          txArguments: {
            validatorAddresses: ["cosmosvaloper1567", "cosmosvaloper1234"]
          },
          gas: `1234567`,
          gas_prices,
          submitType: `local`
        }

        const sendSpy = jest.fn(() =>
          Promise.resolve({
            included: () => Promise.resolve()
          })
        )
        const messageSpy = jest.fn(() => ({
          message: {},
          simulate: () => 123123,
          send: sendSpy
        }))
        const multiMessageSpy = jest.fn(() => ({
          simulate: () => 123123,
          send: sendSpy
        }))
        state.externals.Cosmos = class MockCosmosJs {
          constructor(...args) {
            expect(args).toEqual(["https://lunie.io", "mock-chain"])
            this.MsgWithdrawDelegationReward = messageSpy
            this.MultiMessage = multiMessageSpy
          }
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

        // it creates two withdraw messages, one for each validator
        expect(messageSpy).toHaveBeenCalledWith("cosmos1superaddress", {
          validatorAddress: "cosmosvaloper1567"
        })
        expect(messageSpy).toHaveBeenCalledWith("cosmos1superaddress", {
          validatorAddress: "cosmosvaloper1234"
        })
        // it then aggregates both messages into one transaction
        expect(multiMessageSpy).toHaveBeenCalledWith("cosmos1superaddress", [
          expect.objectContaining({ message: {} }),
          expect.objectContaining({ message: {} })
        ])
        expect(sendSpy).toHaveBeenCalledWith(
          {
            gas: "1234567",
            gasPrices: [
              {
                amount: "0.025",
                denom: "uatom"
              }
            ],
            memo: undefined
          },
          expect.any(Function)
        )
      })
    })
  })
})
