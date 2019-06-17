import keystoreModule from "src/vuex/modules/keystore.js"

jest.mock("@lunie/cosmos-keys", () => ({
  getSeed: () => "a b c"
}))

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
      Sentry: {
        init: jest.fn()
      },
      track: jest.fn(),
      loadKeys: () => [
        {
          name: `def`,
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        }
      ],
      importKey: () => ({
        cosmosAddress: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      }),
      testPassword: () => true,
      getSeed: () => `xxx`
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

  it(`should show an error if loading accounts fails`, async () => {
    jest.spyOn(console, `error`).mockImplementationOnce(() => {})

    jest.resetModules()
    jest.doMock(`scripts/keystore.js`, () => ({
      loadKeys: async () => {
        throw Error(`Error`)
      }
    }))

    const keystoreModule = require(`src/vuex/modules/keystore.js`).default
    module = keystoreModule()
    state = module.state
    actions = module.actions

    const commit = jest.fn()
    await actions.loadAccounts({ commit, state })
    expect(commit).toHaveBeenCalledWith(`notifyError`, {
      body: `Error`,
      title: `Couldn't read keys`
    })
  })

  it(`should test if the login works`, async () => {
    jest.resetModules()
    jest.doMock(`scripts/keystore.js`, () => ({
      testPassword: jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
    }))

    const keystoreModule = require(`src/vuex/modules/keystore.js`).default
    module = keystoreModule()
    state = module.state
    actions = module.actions

    let output = await actions.testLogin(
      {},
      {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        password: `1234567890`
      }
    )
    expect(output).toBe(true)
    output = await actions.testLogin(
      {},
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
      password: "123",
      sessionType: "local"
    })
    expect(state.externals.track).toHaveBeenCalled()
  })

  it(`should load accounts on init`, async () => {
    const dispatch = jest.fn()
    await actions.init({ dispatch })
    expect(dispatch).toHaveBeenCalledWith(`loadAccounts`)
  })
})
