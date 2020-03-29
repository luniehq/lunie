import keystoreModule from "src/vuex/modules/keystore.js"

const networks = [
  {
    id: "cosmos-hub-testnet",
    network_type: "cosmos",
    address_prefix: "cosmos",
    testnet: true
  },
  {
    id: "cosmos-hub-mainnet",
    network_type: "cosmos",
    address_prefix: "cosmos",
    testnet: false
  },
  {
    id: "polkadot-testnet",
    network_type: "polkadot",
    address_prefix: "2",
    testnet: true
  }
]

const mockKeysLib = {
  testPassword: () => true,
  getSeed: () => `xxx`,
  getNewWalletFromSeed: () => ({
    cosmosAddress: "cosmos1234"
  }),
  getWalletIndex: () => [
    {
      name: `def`,
      address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
    }
  ],
  storeWallet: () => {}
}
jest.mock("@lunie/cosmos-keys", () => mockKeysLib)
jest.mock("@polkadot/util-crypto", () => ({
  cryptoWaitReady: () => Promise.resolve()
}))

describe(`Module: Keystore`, () => {
  let module, state, actions, mutations, apollo
  const accounts = [
    {
      address: `tb1zg69v7yszg69v7yszg69v7yszg69v7ysd8ep6q`,
      name: `ACTIVE_ACCOUNT`
    }
  ]

  beforeEach(() => {
    apollo = {
      query: jest.fn(() => ({
        data: {
          network: {
            network_type: "cosmos",
            address_prefix: "cosmos"
          }
        }
      }))
    }
    module = keystoreModule({ apollo })
    state = module.state
    actions = module.actions
    mutations = module.mutations

    state.externals = {
      track: jest.fn()
    }
  })

  describe(`mutations`, () => {
    it(`should set accounts`, () => {
      mutations.setAccounts(state, accounts)
      expect(state.accounts).toEqual(accounts)
    })
  })

  it(`should load accounts`, async () => {
    const commit = jest.fn()
    await actions.loadAccounts({ commit, state })

    expect(commit).toHaveBeenCalledWith(`setAccounts`, [
      {
        name: `def`,
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      }
    ])
  })

  it(`should test if the login works`, async () => {
    jest.doMock("@lunie/cosmos-keys", () => ({
      ...mockKeysLib,
      testPassword: () => {}
    }))
    let output = await actions.testLogin(
      { state },
      {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        password: `1234567890`
      }
    )
    expect(output).toBe(true)

    jest.resetModules()
    jest.doMock("@lunie/cosmos-keys", () => ({
      ...mockKeysLib,
      testPassword: () => {
        throw new Error("Expected")
      }
    }))
    output = await actions.testLogin(
      { state },
      {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        password: `1234567890`
      }
    )
    expect(output).toBe(false)
  })

  it(`should create a seed phrase`, async () => {
    const seed = await actions.createSeed()
    expect(seed).toBe(`xxx`)
  })

  it(`should create a Cosmos address from a seed phrase`, async () => {
    const address = await actions.getAddressFromSeed(
      {
        getters: {
          networks
        }
      },
      {
        seedPhrase: `xxx`,
        network: `cosmos-hub-mainnet`
      }
    )
    expect(address).toBe(`cosmos1234`)
  })

  it(`should create a Polkadot address from a seed phrase`, async () => {
    const address = await actions.getAddressFromSeed(
      {
        getters: {
          networks
        }
      },
      {
        seedPhrase: `enable story warrior detail cradle inherit over cattle unhappy concert reveal clay keep tourist tenant brief simple drum plug inform glue business ski dream`,
        network: `polkadot-testnet`
      }
    )
    expect(address).toBe(`HKFeFq1CTzCfTNhNtQDqe3nCR6WzimGdUdLzr7v7ukw6fnx`)
  })

  it(`should create a key from a seed phrase`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    const dispatch = jest.fn()
    await actions.createKey(
      {
        dispatch,
        state,
        getters: {
          networks
        }
      },
      {
        seedPhrase,
        password,
        name,
        network: "cosmos-hub-mainnet"
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`signIn`, {
      address: "cosmos1234",
      sessionType: "local"
    })
    expect(state.externals.track).toHaveBeenCalled()
  })

  it(`should update the accounts after account creation`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    const dispatch = jest.fn()
    await actions.createKey(
      {
        dispatch,
        state,
        getters: {
          networks
        }
      },
      {
        seedPhrase,
        password,
        name,
        network: "cosmos-hub-mainnet"
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`loadAccounts`)
  })

  it(`should sign in after account creation`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    const dispatch = jest.fn()
    const address = await actions.createKey(
      {
        dispatch,
        state,
        getters: {
          networks
        }
      },
      {
        seedPhrase,
        password,
        name,
        network: "cosmos-hub-mainnet"
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`signIn`, {
      address,
      sessionType: "local"
    })
  })

  it("should handle networks not being supported for account creation (as a fallback)", async () => {
    apollo.query.mockImplementationOnce(() => ({
      data: {}
    }))
    const dispatch = jest.fn()

    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    await expect(
      actions.createKey(
        {
          state,
          dispatch,
          getters: {
            networks
          }
        },
        {
          seedPhrase,
          password,
          name,
          network: "fabo-net"
        }
      )
    ).rejects.toThrowError(
      "Lunie doesn't support address creation for this network."
    )
  })
})
