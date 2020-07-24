import connectionModule from "src/vuex/modules/account.js"

jest.mock("src/../config.js", () => ({
  mobileApp: false,
}))

jest.mock("src/firebase.js", () => () => ({
  auth: () => ({
    onAuthStateChanged: () => {},
    isSignInWithEmailLink: () => true,
    signInWithEmailLink: () => {},
    currentUser: {
      getIdToken: () => "idToken",
    },
  }),
}))

describe(`Module: Connection`, () => {
  let module, state, actions, mutations

  let mockApollo = {
    cache: {
      reset: jest.fn(),
    },
    mutate: jest.fn(),
  }

  beforeEach(() => {
    module = connectionModule({ apollo: mockApollo })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`userSignedIn`, () => {
      state.userSignedIn = false
      mutations.userSignedIn(state, true)
      expect(state.userSignedIn).toBe(true)
    })

    it(`setSignInError`, () => {
      state.signInError = null
      mutations.setSignInError(state, { error: { message: `big error` } })
      expect(state.signInError).toEqual({ error: { message: `big error` } })
    })
  })
  // Sadly it is quite difficult to fully test everything here since it would be necessary to open the email
  // and click on it to be able to test everything connected to the "onAuthStateChanged" Firebase observer.
  describe("actions", () => {
    it(`signs in the user`, async () => {
      const commit = jest.fn()
      localStorage.setItem(
        `user`,
        JSON.stringify({
          user: {
            email: `hello@world.com`,
          },
        })
      )
      await actions.signInUser({ commit }, "app.lunie.io?oobCode=1234")
      expect(commit).toHaveBeenCalledWith(`setSignInError`, undefined) // reset
      expect(commit).toHaveBeenCalledTimes(1)
    })
    it.skip(`sends the user the magic link`, async () => {
      const commit = jest.fn()
      await actions.sendUserMagicLink(
        { commit },
        { user: { email: `hello@world.com` } }
      )
      expect(commit).toHaveBeenCalledTimes(0)
    })
    it.skip(`fails sending the user the magic link`, async () => {
      const commit = jest.fn()
      await actions.sendUserMagicLink(
        { commit },
        { user: { email: `hello@world` } }
      )
      const error = new Error(`The email address is badly formatted.`)
      expect(commit).toHaveBeenCalledWith(`setSignInEmailError`, undefined) // reset
      expect(commit).toHaveBeenCalledWith(`setSignInEmailError`, error)
    })
    it(`signs out the user`, async () => {
      const commit = jest.fn()
      localStorage.setItem(
        JSON.stringify({
          auth_token: `my_auth_token`,
        })
      )
      await actions.signOutUser({ commit })
      const authToken = localStorage.getItem(`auth_token`)
      expect(authToken).toBe(null)
    })
  })
})
