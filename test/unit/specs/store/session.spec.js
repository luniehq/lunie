import sessionModule from "src/vuex/modules/session.js"

describe(`Module: Session`, () => {
  let module, state, actions, mutations, node
  const accounts = [
    {
      address: `tb1zg69v7yszg69v7yszg69v7yszg69v7ysd8ep6q`,
      name: `ACTIVE_ACCOUNT`
    }
  ]

  beforeEach(() => {
    node = {}
    module = sessionModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations

    state.externals = {
      Sentry: {
        init: jest.fn()
      },
      track: jest.fn(),
      anonymize: jest.fn(),
      deanonymize: jest.fn(),
      config: {
        development: false,
        google_analytics_uid: `UA-123`,
        version: `abcfdef`,
        sentry_dsn: `https://1:1@sentry.io/1`,
        default_gas_price: 2.5e-8
      },
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
      generateSeed: () => `xxx`
    }
  })

  it(`should default to signed out state`, () => {
    expect(state.signedIn).toBe(false)
    expect(state.localKeyPairName).toBe(null)
    expect(state.address).toBe(null)
  })

  it("should always default to disable the local signer", () => {
    expect(state.insecureMode).toBe(false)
  })

  describe(`mutations`, () => {
    it(`should set signin`, () => {
      expect(state.signedIn).toBe(false)
      mutations.setSignIn(state, true)
      expect(state.signedIn).toBe(true)
      mutations.setSignIn(state, false)
      expect(state.signedIn).toBe(false)
    })

    it(`should add and remove history correctly`, () => {
      expect(state.history.length).toBe(0)
      mutations.addHistory(state, `/`)
      expect(state.history.length).toBe(1)
      mutations.popHistory(state)
      expect(state.history.length).toBe(0)
    })

    it(`should pauseHistory correctly`, () => {
      expect(state.pauseHistory).toBe(false)
      mutations.pauseHistory(state, true)
      expect(state.pauseHistory).toBe(true)
      mutations.pauseHistory(state, false)
      expect(state.pauseHistory).toBe(false)
    })

    it(`should set the session type`, () => {
      mutations.setSessionType(state, `xxx`)
      expect(state.sessionType).toBe(`xxx`)
    })

    it(`should set accounts`, () => {
      mutations.setAccounts(state, accounts)
      expect(state.accounts).toEqual(accounts)
    })

    it(`should set user address`, () => {
      mutations.setUserAddress(
        state,
        `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      )
      expect(state.address).toEqual(
        `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      )
    })

    it(`should toggle the signin modal`, () => {
      mutations.toggleSessionModal(state, true)
      expect(state.modals.session.active).toBe(true)

      mutations.toggleSessionModal(state, false)
      expect(state.modals.session.active).toBe(false)
    })

    it(`should set the active signin modal view`, () => {
      mutations.setSessionModalView(state, `xxxx`)
      expect(state.modals.session.state).toBe(`xxxx`)
    })

    it(`should activate experimental mode`, () => {
      mutations.setExperimentalMode(state)
      expect(state.experimentalMode).toBe(true)
    })

    it(`should activate insecure mode`, () => {
      mutations.setInsecureMode(state)
      expect(state.insecureMode).toBe(true)
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
    jest.spyOn(console, `error`).mockImplementationOnce(() => { })

    jest.resetModules()
    jest.doMock(`scripts/keystore.js`, () => ({
      loadKeys: async () => {
        throw Error(`Error`)
      }
    }))

    const sessionModule = require(`src/vuex/modules/session.js`).default
    module = sessionModule({ node })
    state = module.state
    actions = module.actions

    const commit = jest.fn()
    await actions.loadAccounts({ commit, state })
    expect(commit).toHaveBeenCalledWith(`notifyError`, {
      body: `Error`,
      title: `Couldn't read keys`
    })
  })

  it(`should clear all session related data`, () => {
    state.history = [`x`]
    state.localKeyPairName = `abc`
    const commit = jest.fn()
    actions.resetSessionData({ state, commit })

    expect(state.history).toEqual([])
    expect(state.localKeyPairName).toBeFalsy()
  })

  it(`should prepare the signin`, async () => {
    const dispatch = jest.fn()
    state.accounts = [{}]
    await actions.showInitialScreen({
      state,
      dispatch
    })
    expect(dispatch).toHaveBeenCalledWith(`resetSessionData`)
  })

  it(`should test if the login works`, async () => {
    jest.resetModules()
    jest.doMock(`scripts/keystore.js`, () => ({
      testPassword: jest
        .fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false)
    }))

    const sessionModule = require(`src/vuex/modules/session.js`).default
    module = sessionModule({ node })
    state = module.state
    actions = module.actions

    let output = await actions.testLogin(
      {},
      {
        localKeyPairName: `default`,
        password: `1234567890`
      }
    )
    expect(output).toBe(true)
    output = await actions.testLogin(
      {},
      {
        localKeyPairName: `default`,
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
    expect(dispatch).toHaveBeenCalledWith(`initializeWallet`, {
      address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
    })
    expect(state.externals.track).toHaveBeenCalled()
  })

  describe(`Signs in`, () => {
    it(`with local keystore`, async () => {
      const localKeyPairName = `def`
      const commit = jest.fn()
      const dispatch = jest.fn()
      const sessionType = `local`
      const address = `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      await actions.signIn(
        { state, commit, dispatch },
        { localKeyPairName, address, sessionType }
      )
      expect(commit).toHaveBeenCalledWith(
        `setUserAddress`,
        `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      )
      expect(commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
      expect(commit).toHaveBeenCalledWith(`setSessionType`, `local`)
      expect(dispatch).toHaveBeenCalledWith(`loadPersistedState`)
      expect(dispatch).toHaveBeenCalledWith(`initializeWallet`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      })
      expect(state.externals.track).toHaveBeenCalledWith(
        `event`,
        `session`,
        `sign-in`,
        `local`
      )
    })

    it(`with Ledger Nano`, async () => {
      const address = `cosmos1qpd4xgtqmxyf9ktjh757nkdfnzpnkamny3cpzv`
      const commit = jest.fn()
      const dispatch = jest.fn()
      await actions.signIn(
        { state, commit, dispatch },
        { sessionType: `ledger`, address }
      )
      expect(commit).toHaveBeenCalledWith(`setUserAddress`, address)
      expect(commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
      expect(commit).toHaveBeenCalledWith(`setSessionType`, `ledger`)
      expect(dispatch).toHaveBeenCalledWith(`loadPersistedState`)
      expect(dispatch).toHaveBeenCalledWith(`initializeWallet`, { address })
      expect(state.externals.track).toHaveBeenCalledWith(
        `event`,
        `session`,
        `sign-in`,
        `ledger`
      )
    })

    it(`in explore mode`, async () => {
      const address = `cosmos1qpd4xgtqmxyf9ktjh757nkdfnzpnkamny3cpzv`
      const commit = jest.fn()
      const dispatch = jest.fn()
      await actions.signIn(
        { state, commit, dispatch },
        { sessionType: `explore`, address }
      )
      expect(commit).toHaveBeenCalledWith(`setUserAddress`, address)
      expect(commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
      expect(commit).toHaveBeenCalledWith(`setSessionType`, `explore`)
      expect(dispatch).toHaveBeenCalledWith(`loadPersistedState`)
      expect(dispatch).toHaveBeenCalledWith(`initializeWallet`, { address })
      expect(state.externals.track).toHaveBeenCalledWith(
        `event`,
        `session`,
        `sign-in`,
        `explore`
      )
    })
  })

  it(`should sign out`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.signOut({ state, commit, dispatch })

    expect(dispatch).toHaveBeenCalledWith(`resetSessionData`)
    expect(commit).toHaveBeenCalledWith(`addHistory`, `/`)
    expect(commit).toHaveBeenCalledWith(`setSignIn`, false)
    expect(state.localKeyPairName).toBeNull()
    expect(state.externals.track).toHaveBeenCalled()
  })

  it(`should enable error collection`, async () => {
    jest.spyOn(console, `log`).mockImplementationOnce(() => { })
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.setErrorCollection(
      {
        state,
        commit,
        dispatch
      },
      true
    )

    expect(state.errorCollection).toBe(true)
    expect(state.externals.Sentry.init).toHaveBeenCalledWith({
      dsn: expect.stringMatching(`https://.*@sentry.io/.*`),
      release: `abcfdef`
    })
  })

  it(`should disable error collection`, async () => {
    jest.spyOn(console, `log`).mockImplementationOnce(() => { })
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.setErrorCollection(
      {
        state,
        commit,
        dispatch
      },
      false
    )

    expect(state.errorCollection).toBe(false)
    expect(state.externals.Sentry.init).toHaveBeenCalledWith({})
  })

  it(`should disable analytics collection`, async () => {
    jest.spyOn(console, `log`).mockImplementationOnce(() => { })
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.setAnalyticsCollection(
      {
        state,
        commit,
        dispatch
      },
      false
    )

    expect(state.analyticsCollection).toBe(false)
    expect(state.externals.anonymize).toHaveBeenCalled()
  })

  it(`should load the persisted user preferences`, () => {
    localStorage.setItem(`lunie_user_preferences`, undefined)
    const dispatch = jest.fn()
    actions.loadLocalPreferences({
      state,
      dispatch
    })
    expect(state.cookiesAccepted).toBe(false)

    localStorage.setItem(
      `lunie_user_preferences`,
      JSON.stringify({
        errorCollection: true,
        analyticsCollection: true
      })
    )
    state.errorCollection = false
    state.analyticsCollection = false

    actions.loadLocalPreferences({
      state,
      dispatch
    })
    expect(state.cookiesAccepted).toBe(true)
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, true)

    localStorage.setItem(
      `lunie_user_preferences`,
      JSON.stringify({
        errorCollection: false,
        analyticsCollection: false
      })
    )
    state.errorCollection = true
    state.analyticsCollection = true

    dispatch.mockClear()
    actions.loadLocalPreferences({
      state,
      dispatch
    })

    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, false)
    expect(dispatch).toHaveBeenCalledWith(`setAnalyticsCollection`, false)
  })

  it(`should store the persisted user preferences`, () => {
    localStorage.setItem(`lunie_user_preferences`, ``)
    state.errorCollection = true
    state.analyticsCollection = true

    actions.storeLocalPreferences({
      state
    })

    expect(localStorage.getItem(`lunie_user_preferences`)).toBe(
      `{"errorCollection":true,"analyticsCollection":true}`
    )
  })

  it(`should reload accounts on reconnect as this could be triggered by a switch from a mocked connection`, async () => {
    const dispatch = jest.fn()
    await actions.reconnected({ state, dispatch })
    expect(dispatch).toHaveBeenCalledWith(`loadAccounts`)
  })

  describe(`persistance`, () => {
    it(`persists the session in localstorage`, async () => {
      await actions.persistSession(
        {},
        { localKeyPairName: `def`, address: `xxx`, sessionType: `local` }
      )
      expect(localStorage.getItem(`session`)).toEqual(
        JSON.stringify({
          localKeyPairName: `def`,
          address: `xxx`,
          sessionType: `local`
        })
      )
    })

    it(`persists the session on sign in`, async () => {
      const dispatch = jest.fn()
      await actions.signIn(
        { state, commit: jest.fn(), dispatch },
        { localKeyPairName: `def`, address: `xxx`, sessionType: `local` }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        localKeyPairName: `def`,
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        sessionType: `local`
      })

      dispatch.mockClear()
      await actions.signIn(
        { state, commit: jest.fn(), dispatch },
        { address: `xxx`, sessionType: `ledger` }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        address: `xxx`,
        sessionType: `ledger`
      })
    })

    it(`removes the persisted session on sign out`, async () => {
      localStorage.setItem(`session`, `xxx`)
      await actions.signOut({ state, commit: jest.fn(), dispatch: jest.fn() })
      expect(localStorage.getItem(`session`)).toBeNull()
    })

    it(`signs the user in if a session was found`, async () => {
      const dispatch = jest.fn()
      localStorage.setItem(
        `session`,
        JSON.stringify({
          localKeyPairName: `def`,
          address: `xxx`,
          sessionType: `local`
        })
      )
      await actions.checkForPersistedSession({ dispatch })
      expect(dispatch).toHaveBeenCalledWith(`signIn`, {
        localKeyPairName: `def`,
        address: `xxx`,
        sessionType: `local`
      })

      dispatch.mockClear()
      localStorage.removeItem(`session`)
      await actions.checkForPersistedSession({ dispatch })
      expect(dispatch).not.toHaveBeenCalled()
    })
  })
})
