import keystoreModule from "src/vuex/modules/keystore.js"

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
  let module, state, actions, mutations
  const accounts = [
    {
      address: `tb1zg69v7yszg69v7yszg69v7yszg69v7ysd8ep6q`,
      name: `ACTIVE_ACCOUNT`
    }
  ]
  let mockApollo = {
    async query() {
      return {
        data: {
          networks: [
            { id: `awesomenet`, bech32_prefix: `awesome` },
            { id: `keine-ahnungnet`, bech32_prefix: `keine` },
            { id: `localnet`, bech32_prefix: `local` }
          ]
        }
      }
    }
  }
  beforeEach(() => {
    module = keystoreModule({ apollo: mockApollo })
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

  it.skip(`should get the bech32 prefix of the current network`, async () => {
    localStorage.setItem(
      JSON.stringify({
        network: `keine-ahnungnet`
      })
    )
    // not working. I need to figure out where to put this function within keystore.js. mutations/actions
    const bech32Prefix = await module.getBech32Prefix()
    expect(bech32Prefix).toBe(`keine`)
  })

  it(`should create a seed phrase`, async () => {
    const seed = await actions.createSeed()
    expect(seed).toBe(`xxx`)
  })

  it.skip(`should create a key from a seed phrase`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    const dispatch = jest.fn()
    await actions.createKey(
      { dispatch, state },
      {
        seedPhrase,
        password,
        name
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`signIn`, {
      address: "cosmos1234",
      sessionType: "local"
    })
    expect(state.externals.track).toHaveBeenCalled()
  })

  it.skip(`should update the accounts after account creation`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    const dispatch = jest.fn()
    await actions.createKey(
      { dispatch, state },
      {
        seedPhrase,
        password,
        name
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`loadAccounts`)
  })

  it.skip(`should sign in after account creation`, async () => {
    const seedPhrase = `abc`
    const password = `123`
    const name = `def`
    const dispatch = jest.fn()
    const address = await actions.createKey(
      { dispatch, state },
      {
        seedPhrase,
        password,
        name
      }
    )
    expect(dispatch).toHaveBeenCalledWith(`signIn`, {
      address,
      sessionType: "local"
    })
  })
})
