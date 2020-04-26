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
    const address = await actions.getAddressFromSeed(undefined, {
      seedPhrase: `xxx`,
      network: {
        id: "cosmos-hub-testnet",
        network_type: "cosmos",
        address_prefix: "cosmos",
        testnet: true
      }
    })
    expect(address).toBe(`cosmos1234`)
  })

  it(`should create a Polkadot address from a 12 words seed phrase`, async () => {
    jest.setTimeout(10000)
    const store = {
      getters: {
        networks: [
          {
            id: "polkadot-testnet",
            network_type: "polkadot",
            address_prefix: "2"
          }
        ]
      }
    }
    const address = await actions.getAddressFromSeed(store, {
      seedPhrase: `lunch primary know smoke track sustain parrot enact shock final rookie banana`,
      network: networks[2]
    })
    expect(address).toBe(`DcjhGvTmsVvJHzqFR1SQVHs77cFTQTJrm59WPM4FRgbGFoR`)
  })

  it(`should create a Polkadot address from a 24 words seed phrase`, async () => {
    const store = {
      getters: {
        networks: [
          {
            id: "polkadot-testnet",
            network_type: "polkadot",
            address_prefix: "2"
          }
        ]
      }
    }
    const address = await actions.getAddressFromSeed(store, {
      seedPhrase: `spirit ride warm like ribbon axis minimum number myth wrestle minute amount subway whip system axis cross box actual rifle control profit town advice`,
      network: {
        id: `polkadot-testnet`,
        network_type: `polkadot`,
        address_prefix: 2
      }
    })
    expect(address).toBe(`DGTPCmSeaMKKkno6GMLteH6JUBjjRf6PEtvLgmKQS4SV3Tc`)
  })

  it(`should create a Polkadot address from a raw hex seed phrase`, async () => {
    const store = {}
    const address = await actions.getAddressFromSeed(store, {
      seedPhrase: `0x2fbaa6dc94a4bc904cc913de9151b890c5c1de1beb08ec01c96b66b355a7b9ca`,
      network: {
        id: `polkadot-testnet`,
        network_type: `polkadot`,
        address_prefix: 2
      }
    })
    expect(address).toBe(`EkpVDgUgARxa96strjK5oCiEdLTokcTqw4uUMqEGBTmibLe`)
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
    const store = {
      dispatch: jest.fn(),
      getters: {
        networks: [
          {
            id: "fabo-net",
            network_type: "fabocolor"
          }
        ]
      }
    }

    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    await expect(
      actions.createKey(store, {
        seedPhrase,
        password,
        name,
        network: "fabo-net"
      })
    ).rejects.toThrowError(
      "Lunie doesn't support address creation for this network."
    )
  })
})
