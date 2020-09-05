import sessionModule from "src/vuex/modules/session.js"
import { handleSessionCrypto } from "src/vuex/modules/session.js"

describe(`Module: Session`, () => {
  let module, state, actions, mutations

  const networks = [
    { id: `awesomenet`, slug: `awesome` },
    { id: `keine-ahnungnet`, slug: `ahnungnet` },
    { id: `fabo-net`, slug: `fabo` },
  ]

  let mockApollo = {
    async query() {
      return {
        data: {
          networks,
        },
      }
    },
  }

  beforeEach(() => {
    module = sessionModule({ apollo: mockApollo })
    state = module.state
    actions = module.actions
    mutations = module.mutations

    state.externals = {
      track: jest.fn(),
      anonymize: jest.fn(),
      deanonymize: jest.fn(),
      config: {
        development: false,
        google_analytics_uid: `UA-123`,
        version: `abcfdef`,
        default_gas_price: 2.5e-8,
      },
    }
  })

  it(`should default to signed out state`, () => {
    expect(state.signedIn).toBe(false)
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

    it(`should set user address`, () => {
      mutations.setUserAddress(
        state,
        `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      )
      expect(state.address).toEqual(
        `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      )
    })

    it(`should add user address to previously used addresses array`, () => {
      let addresses = [
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          sessionType: `explore`,
        },
      ]
      mutations.setUserAddresses(state, addresses)
      expect(state.addresses).toEqual(addresses)
    })

    it(`should add user address respecting legacy entries`, () => {
      let addresses = [
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          type: `explore`,
        },
      ]
      mutations.setUserAddresses(state, addresses)
      expect(state.addresses).toEqual([
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          sessionType: `explore`,
        },
      ])
    })

    it(`should activate experimental mode`, () => {
      mutations.setExperimentalMode(state)
      expect(state.experimentalMode).toBe(true)
    })

    it(`should activate insecure mode`, () => {
      mutations.setInsecureMode(state, true)
      expect(state.insecureMode).toBe(true)
    })

    it(`should set current modal`, () => {
      expect(state.currrentModalOpen).toBe(false)
      mutations.setCurrrentModalOpen(state, true)
      expect(state.currrentModalOpen).toBe(true)
    })
  })

  it(`should clear all session related data`, () => {
    state.history = [`/x`]
    const commit = jest.fn()
    actions.resetSessionData({ state, commit }, `keine-ahnungnet`)

    expect(state.history).toEqual(["/"])
    expect(localStorage.getItem(`session`)).toBeNull()
  })

  describe(`Signs in`, () => {
    it(`with local keystore`, async () => {
      const commit = jest.fn()
      const dispatch = jest.fn()
      const sessionType = `local`
      const address = `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      const HDPath = `m/44'/118'/0'/0/0`
      const curve = `ed25519`
      const rootState = {
        connection: {
          networks: [
            {
              id: `happy-net`,
              defaultHDPath: `m/44'/118'/0'/0/0`,
            },
          ],
        },
      }
      await actions.signIn(
        {
          state,
          rootState,
          commit,
          dispatch,
        },
        { address, sessionType, HDPath, curve, networkId: `happy-net` }
      )
      expect(commit).toHaveBeenCalledWith(`setNetworkId`, `happy-net`)
      expect(dispatch).toHaveBeenCalledWith(`persistNetwork`, {
        id: `happy-net`,
      })
      expect(commit).toHaveBeenCalledWith(
        `setUserAddress`,
        `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      )
      expect(commit).toHaveBeenCalledWith(`setSessionType`, `local`)
      expect(state.externals.track).toHaveBeenCalledWith(
        `event`,
        `session`,
        `sign-in`,
        `local`,
        `m/44'/118'/0'/0/0`,
        `ed25519`
      )
    })

    it(`with Ledger Nano`, async () => {
      const address = `cosmos1qpd4xgtqmxyf9ktjh757nkdfnzpnkamny3cpzv`
      const HDPath = `m/44'/118'/0'/0/0`
      const curve = `ed25519`
      const commit = jest.fn()
      const dispatch = jest.fn()
      const rootState = {
        connection: {
          networks: [
            {
              id: `fabo-net`,
              defaultHDPath: `m/44'/118'/0'/0/0`,
            },
          ],
        },
      }
      await actions.signIn(
        {
          state,
          rootState,
          commit,
          dispatch,
        },
        { sessionType: `ledger`, address, HDPath, curve, networkId: `fabo-net` }
      )
      expect(commit).toHaveBeenCalledWith(`setUserAddress`, address)
      expect(commit).toHaveBeenCalledWith(`setSessionType`, `ledger`)
      expect(state.externals.track).toHaveBeenCalledWith(
        `event`,
        `session`,
        `sign-in`,
        `ledger`,
        `m/44'/118'/0'/0/0`,
        `ed25519`
      )
    })

    it(`in explore mode`, async () => {
      const address = `cosmos1qpd4xgtqmxyf9ktjh757nkdfnzpnkamny3cpzv`
      const commit = jest.fn()
      const dispatch = jest.fn()
      const rootState = {
        connection: {
          networks: [
            {
              id: `fabo-net`,
              defaultHDPath: `m/44'/118'/0'/0/0`,
              defaultCurve: `ed25519`,
            },
          ],
        },
      }
      await actions.signIn(
        {
          state,
          rootState,
          commit,
          dispatch,
        },
        { sessionType: `explore`, address, networkId: `fabo-net` }
      )
      expect(commit).toHaveBeenCalledWith(`setUserAddress`, address)
      expect(commit).toHaveBeenCalledWith(`setSessionType`, `explore`)
      expect(state.externals.track).toHaveBeenCalledWith(
        `event`,
        `session`,
        `sign-in`,
        `explore`,
        `m/44'/118'/0'/0/0`,
        `ed25519`
      )
    })

    it("should register device with correct addressObjects", async () => {
      const commit = jest.fn()
      const dispatch = jest.fn()
      const sessionType = `local`
      const address = `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      state.signedIn = true
      state.addresses = [
        {
          address: `123`,
          type: `explore`,
          networkId: "fabo-net",
        },
        {
          address: `456`,
          type: `ledger`,
          networkId: "not-fabo-net",
        },
      ]
      const rootState = {
        connection: {
          networks: [
            {
              id: `fabo-net`,
              defaultHDPath: `m/44'/118'/0'/0/0`,
            },
          ],
        },
      }
      localStorage.setItem(
        "session_fabo-net",
        JSON.stringify({ address, networkId: "not-fabo-net" })
      )
      await actions.signIn(
        {
          state,
          rootState,
          commit,
          dispatch,
        },
        { address, sessionType, networkId: "fabo-net" }
      )
      localStorage.removeItem("session_fabo-net")
    })

    it("should dispatch required actions", async () => {
      const address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
      const commit = jest.fn()
      const dispatch = jest.fn()
      state.signedIn = true
      state.addresses = [
        {
          address: `123`,
          type: `explore`,
        },
        {
          address: `456`,
          type: `ledger`,
        },
      ]
      const rootState = {
        connection: {
          networks: [
            {
              id: `happy-net`,
              defaultHDPath: `m/44'/118'/0'/0/0`,
              defaultCurve: `ed25519`,
            },
          ],
        },
      }
      await actions.signIn(
        {
          state,
          rootState,
          commit,
          dispatch,
        },
        { sessionType: `explore`, address, networkId: "happy-net" }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistAddresses`, [
        {
          address: `123`,
          type: `explore`,
        },
        {
          address: `456`,
          type: `ledger`,
        },
      ])
      expect(dispatch).toHaveBeenCalledWith(`persistNetwork`, {
        id: "happy-net",
      })
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
        sessionType: `explore`,
        networkId: "happy-net",
        HDPath: `m/44'/118'/0'/0/0`,
        curve: `ed25519`,
      })
      expect(dispatch).toHaveBeenCalledWith(`rememberAddress`, {
        address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
        sessionType: `explore`,
        networkId: `happy-net`,
        HDPath: `m/44'/118'/0'/0/0`,
        curve: `ed25519`,
      })
    })

    it("should commit checkForPersistedAddresses when dispatch checkForPersistedAddresses ", async () => {
      const address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
      const commit = jest.fn()
      state.signedIn = true
      state.addresses = [
        {
          address: `123`,
          sessionType: `explore`,
          networkId: "happy-net",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
        },
      ]
      await actions.rememberAddress(
        { state, commit },
        {
          sessionType: `explore`,
          address,
          networkId: "happy-net",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
        }
      )
      expect(commit).toHaveBeenCalledWith(`setUserAddresses`, [
        {
          address: `123`,
          sessionType: `explore`,
          networkId: "happy-net",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
        },
        {
          address,
          sessionType: `explore`,
          networkId: "happy-net",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
          name: undefined,
        },
      ])
    })

    it("should remember the address", async () => {
      const address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
      const commit = jest.fn()
      state.signedIn = true
      await actions.rememberAddress(
        { state, commit },
        {
          sessionType: `explore`,
          address,
          networkId: "fabo-net",
          name: "testaddress",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
        }
      )
      expect(commit).toHaveBeenCalledWith(`setUserAddresses`, [
        {
          sessionType: `explore`,
          address,
          networkId: "fabo-net",
          name: "testaddress",
          HDPath: `m/44'/118'/0'/0/0`,
          curve: `ed25519`,
        },
      ])
    })

    // too costly to test
    xdescribe("checkAddressRole", () => {
      it("should set the role to a stash account", async () => {
        jest.setTimeout(60000)
        const nodeEnv = process.env.NODE_ENV
        process.env.NODE_ENV = "production"

        try {
          const address = `F7uBbx4pbZ5u7eRGPExD6SKSA6TVqTsLf7daXYjAeEChcEY`
          const commit = jest.fn()
          await actions.checkAddressRole(
            { commit },
            {
              address,
              currentNetwork: {
                id: "kusama",
                network_type: "polkadot",
              },
            }
          )
          expect(commit).toHaveBeenCalledWith(`setUserAddressRole`, {
            addressRole: `stash`,
          })
        } finally {
          process.env.NODE_ENV = nodeEnv
        }
      })
    })
  })

  it(`should sign out`, async () => {
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.signOut({ state, commit, dispatch }, "red-feliz")

    expect(dispatch).toHaveBeenCalledWith(`resetSessionData`, "red-feliz")
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
        dispatch,
      },
      true
    )

    expect(state.errorCollection).toBe(true)
  })

  it(`should disable error collection`, async () => {
    jest.spyOn(console, `log`).mockImplementationOnce(() => {})
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.setErrorCollection(
      {
        state,
        commit,
        dispatch,
      },
      false
    )

    expect(state.errorCollection).toBe(false)
  })

  it(`should disable analytics collection`, async () => {
    jest.spyOn(console, `log`).mockImplementationOnce(() => {})
    const commit = jest.fn()
    const dispatch = jest.fn()
    await actions.setAnalyticsCollection(
      {
        state,
        commit,
        dispatch,
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
      dispatch,
    })
    expect(state.cookiesAccepted).toBe(false)

    localStorage.setItem(
      `lunie_user_preferences`,
      JSON.stringify({
        cookiesAccepted: true,
        errorCollection: true,
        analyticsCollection: true,
        preferredCurrency: `USD`,
      })
    )
    state.errorCollection = false
    state.analyticsCollection = false

    actions.loadLocalPreferences({
      state,
      dispatch,
    })
    expect(state.cookiesAccepted).toBe(true)
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, true)

    localStorage.setItem(
      `lunie_user_preferences`,
      JSON.stringify({
        cookiesAccepted: false,
        errorCollection: false,
        analyticsCollection: false,
        preferredCurrency: `USD`,
      })
    )
    state.errorCollection = true
    state.analyticsCollection = true

    dispatch.mockClear()
    actions.loadLocalPreferences({
      state,
      dispatch,
    })
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, false)
    expect(dispatch).toHaveBeenCalledWith(`setAnalyticsCollection`, false)
    expect(dispatch).toHaveBeenCalledWith(`setPreferredCurrency`, `USD`)
  })

  it(`should store the persisted user preferences`, () => {
    localStorage.setItem(`lunie_user_preferences`, ``)
    state.errorCollection = true
    state.analyticsCollection = true
    state.preferredCurrency = "USD"

    actions.storeLocalPreferences({
      state,
    })

    expect(localStorage.getItem(`lunie_user_preferences`)).toBe(
      `{"cookiesAccepted":true,"errorCollection":true,"analyticsCollection":true,"preferredCurrency":"USD"}`
    )
  })

  describe(`persistance`, () => {
    it(`persists the session in localstorage`, async () => {
      await actions.persistSession(
        {},
        { address: `xxx`, sessionType: `local`, networkId: "fabo-net" }
      )
      expect(localStorage.getItem(`session_fabo-net`)).toEqual(
        JSON.stringify({
          address: `xxx`,
          sessionType: `local`,
        })
      )
    })

    it(`persists the session on sign in`, async () => {
      const dispatch = jest.fn()
      const rootState = {
        connection: {
          networks: [
            {
              id: `happy-net`,
              defaultHDPath: `m/44'/118'/0'/0/0`,
              defaultCurve: `ed25519`,
            },
          ],
        },
      }
      await actions.signIn(
        {
          state,
          rootState,
          commit: jest.fn(),
          dispatch,
        },
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          sessionType: `local`,
          networkId: `happy-net`,
        }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistNetwork`, {
        id: "happy-net",
      })
      expect(dispatch).toHaveBeenCalledWith(`rememberAddress`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        sessionType: `local`,
        networkId: `happy-net`,
        HDPath: `m/44'/118'/0'/0/0`,
        curve: `ed25519`,
      })
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        sessionType: `local`,
        networkId: "happy-net",
        HDPath: `m/44'/118'/0'/0/0`,
        curve: `ed25519`,
      })

      dispatch.mockClear()
      await actions.signIn(
        {
          state,
          rootState,
          commit: jest.fn(),
          dispatch,
        },
        {
          address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
          sessionType: `ledger`,
          networkId: `happy-net`,
        }
      )
      expect(dispatch).toHaveBeenCalledWith(`persistNetwork`, {
        id: "happy-net",
      })
      expect(dispatch).toHaveBeenCalledWith(`rememberAddress`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        sessionType: `ledger`,
        networkId: `happy-net`,
        HDPath: `m/44'/118'/0'/0/0`,
        curve: `ed25519`,
      })
      expect(dispatch).toHaveBeenCalledWith(`persistSession`, {
        address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        sessionType: `ledger`,
        networkId: "happy-net",
        HDPath: `m/44'/118'/0'/0/0`,
        curve: `ed25519`,
      })
    })

    it(`signs the user in if a session was found`, async () => {
      const dispatch = jest.fn()
      const commit = jest.fn()
      localStorage.setItem(
        `session_fabo-net`,
        JSON.stringify({
          address: `xxx`,
          networkId: `fabo-net`,
          sessionType: `local`,
        })
      )
      await actions.checkForPersistedSession({
        dispatch,
        rootState: {
          connection: { network: "fabo-net" },
        },
      })
      expect(dispatch).toHaveBeenCalledWith(`signIn`, {
        address: `xxx`,
        networkId: `fabo-net`,
        sessionType: `local`,
      })

      dispatch.mockClear()
      localStorage.removeItem(`session_fabo-net`)
      await actions.checkForPersistedSession({
        commit,
        dispatch,
        rootState: {
          connection: { network: "fabo-net" },
        },
      })
      expect(dispatch).not.toHaveBeenCalled()
    })
  })

  it(`signes the user out if no persisted session for the network was found`, async () => {
    const dispatch = jest.fn()
    const commit = jest.fn()
    localStorage.setItem(
      `session_fabo-net`,
      JSON.stringify({
        address: `xxx`,
        sessionType: `local`,
      })
    )
    await actions.checkForPersistedSession({
      dispatch,
      commit,
      rootState: {
        connection: { network: "red-feliz" },
      },
    })
    expect(commit).toHaveBeenCalledWith(`setSignIn`, false)
  })

  it("should save used addresses in local storage", async () => {
    state.addresses = [
      {
        address: `123`,
        type: `explore`,
      },
    ]
    await actions.persistAddresses({}, state.addresses)
    expect(localStorage.getItem(`addresses`)).toEqual(
      JSON.stringify([
        {
          address: `123`,
          type: `explore`,
        },
      ])
    )
  })

  it(`should restore previously used addresses from local storage`, async () => {
    const commit = jest.fn()
    localStorage.setItem(
      `addresses`,
      JSON.stringify([
        {
          address: `xxx`,
          type: `explore`,
        },
        {
          address: `yyy`,
          type: `ledger`,
        },
      ])
    )
    await actions.checkForPersistedAddresses({ commit })
    expect(commit).toHaveBeenCalledWith(`setUserAddresses`, [
      {
        address: `xxx`,
        type: `explore`,
      },
      {
        address: `yyy`,
        type: `ledger`,
      },
    ])
  })

  it("getAllSessionAddresses", async () => {
    localStorage.setItem(
      "session_fabo-net",
      JSON.stringify({
        address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
        networkId: "fabo-net",
      })
    )
    localStorage.setItem(
      "session_lunie-net",
      JSON.stringify({
        address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn1",
        networkId: "not-fabo-net",
      })
    )

    const addresses = await actions.getAllSessionAddresses({
      rootState: { connection: { networks } },
    })
    expect(addresses).toEqual([
      {
        networkId: "fabo-net",
        address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
      },
    ])
  })

  it(`Handles crypto for a session`, () => {
    // takes HDPath and curve from a pre-existing session
    const session = {
      name: "testaddress",
      address: "cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
      networkId: "fabo-net",
      HDPath: "m/44'/118'/0'/0/0",
      curve: "ed25519",
    }
    let finalCrypto = handleSessionCrypto({
      session,
      address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    })
    expect(finalCrypto.HDPath).toBe("m/44'/118'/0'/0/0")
    expect(finalCrypto.curve).toBe("ed25519")

    // takes HDPath and curve from currentNetwork defaults
    const currentNetwork = {
      defaultHDPath: "m/44'/118'/0'/0/0",
      defaultCurve: "ed25519",
    }
    finalCrypto = handleSessionCrypto({ currentNetwork })
    expect(finalCrypto.HDPath).toBe("m/44'/118'/0'/0/0")
    expect(finalCrypto.curve).toBe("ed25519")
  })
})
