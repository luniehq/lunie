import sessionModule from "src/vuex/modules/session.js"

describe(`Module: Session`, () => {
  let module, state, actions, mutations, node

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
      }
    }
  })

  it(`should default to signed out state`, () => {
    expect(state.signedIn).toBe(false)
    expect(state.address).toBe(null)
  })

  it("should always default to disable the local signer", () => {
    expect(state.insecureMode).toBe(false)
  })

  it(`should default to extension not installed`, () => {
    expect(state.extensionInstalled).toBe(false)
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

    it(`should set extension`, () => {
      expect(state.extensionInstalled).toBe(false)
      mutations.setExtensionInstalled(state, true)
      expect(state.extensionInstalled).toBe(true)
      mutations.setExtensionInstalled(state, false)
      expect(state.extensionInstalled).toBe(false)
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

  it(`should clear all session related data`, () => {
    state.history = [`x`]
    const commit = jest.fn()
    actions.resetSessionData({ state, commit })

    expect(state.history).toEqual([])
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

  describe(`Signs in`, () => {
    it(`with local keystore`, async () => {
      const commit = jest.fn()
      const dispatch = jest.fn()
      const sessionType = `local`
      const address = `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      await actions.signIn(
        { state, commit, dispatch },
        { address, sessionType }
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
    expect(state.externals.track).toHaveBeenCalled()
  })

  it(`should enable error collection`, async () => {
    jest.spyOn(console, `log`).mockImplementationOnce(() => {})
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
    jest.spyOn(console, `log`).mockImplementationOnce(() => {})
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
    jest.spyOn(console, `log`).mockImplementationOnce(() => {})
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

  describe(`persistance`, () => {
    it(`persists the session in localstorage`, async () => {
      await actions.persistSession({}, { address: `xxx`, sessionType: `local` })
      expect(localStorage.getItem(`session`)).toEqual(
        JSON.stringify({
          address: `xxx`,
          sessionType: `local`
        })
      )
    })

    it(`persists the session on sign in`, async () => {
      const dispatch = jest.fn()
      await actions.signIn(
        { state, commit: jest.fn(), dispatch },
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          sessionType: `local`
        }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        sessionType: `local`
      })

      dispatch.mockClear()
      await actions.signIn(
        { state, commit: jest.fn(), dispatch },
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          sessionType: `ledger`
        }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
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
          address: `xxx`,
          sessionType: `local`
        })
      )
      await actions.checkForPersistedSession({ dispatch })
      expect(dispatch).toHaveBeenCalledWith(`signIn`, {
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
