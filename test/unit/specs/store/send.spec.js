import sendModule from "src/vuex/modules/send"

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

const mockState = {
  bondDenom: "uatom"
}

describe(`Module: Send`, () => {
  let module, actions, node

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
    actions = module.actions
  })

  describe(`Actions`, () => {
    it(`should update optimistically`, () => {
      const commit = jest.fn()
      const getters = {
        liquidAtoms: 10000000,
        bondDenom: `uatom`
      }

      actions.postMsgSend(
        { rootState: mockRootState, state: mockState, commit, getters },
        {
          txProps: {
            toAddress: "cosmos1234",
            amounts: [{ amount: 5000000, denom: "stake" }]
          },
          txMeta: {
            gasEstimate: 100000,
            gasPrice: { amount: 10, denom: "uatom" }
          }
        }
      )

      expect(commit).toHaveBeenCalledWith(`updateWalletBalance`, {
        denom: `uatom`,
        amount: 4000000
      })
    })
  })
})
