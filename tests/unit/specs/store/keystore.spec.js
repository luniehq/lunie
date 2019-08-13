import keystoreModule from "src/vuex/modules/keystore.js"

describe(`Module: Keystore`, () => {
  let module, state, actions, mutations
  const accounts = [
    {
      address: `tb1zg69v7yszg69v7yszg69v7yszg69v7ysd8ep6q`,
      name: `ACTIVE_ACCOUNT`
    }
  ]

  beforeEach(() => {
    module = keystoreModule()
    state = module.state
    actions = module.actions
    mutations = module.mutations

    state.externals = {
      track: jest.fn(),
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
    state.externals.testPassword = jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error("Expected")
      })
    let output = await actions.testLogin(
      { state },
      {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        password: `1234567890`
      }
    )
    expect(output).toBe(true)
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

  it(`should create a key from a seed phrase`, async () => {
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

  it(`should update the accounts after account creation`, async () => {
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

  it(`should sign in after account creation`, async () => {
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

  it(`should load accounts on init`, async () => {
    const dispatch = jest.fn()
    await actions.init({ dispatch })
    expect(dispatch).toHaveBeenCalledWith(`loadAccounts`)
  })
})
