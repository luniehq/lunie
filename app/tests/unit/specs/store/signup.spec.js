import recoverModule from "src/vuex/modules/signup.js"

describe(`Module: Signup`, () => {
  let module, state, actions, mutations, node

  const emptyState = {
    signUpName: ``,
    signUpSeed: `Creating seed...`,
    signUpPassword: ``,
    signUpPasswordConfirm: ``,
    signUpWarning: false,
  }

  beforeEach(() => {
    node = {}
    module = recoverModule({ node })
    state = module.state
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`should update field`, () => {
      const name = `HappyLunieUser`
      expect(state.signUpName).toBe(``)
      mutations.updateField(state, { field: `signUpName`, value: name })
      expect(state.signUpName).toEqual(name)
    })

    it(`should reset signup data`, () => {
      mutations.resetSignUpData(state)
      expect(state).toEqual(emptyState)
    })
  })

  describe(`actions`, () => {
    it(`should reset signup data`, async () => {
      const commit = jest.fn()
      await actions.resetSignUpData({ commit })
      expect(commit).toHaveBeenCalledWith(`resetSignUpData`)
    })
  })
})
