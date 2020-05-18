import recoverModule from "src/vuex/modules/recover.js"

describe(`Module: Recover`, () => {
  let module, state, actions, mutations, node

  const emptyState = {
    name: ``,
    seed: ``,
    password: ``,
    passwordConfirm: ``,
    warning: false,
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
      expect(state.name).toBe(``)
      mutations.updateField(state, { field: `name`, value: name })
      expect(state.name).toEqual(name)
    })

    it(`should reset recover data`, () => {
      mutations.resetRecoverData(state)
      expect(state).toEqual(emptyState)
    })
  })

  describe(`actions`, () => {
    it(`should reset recover data`, async () => {
      const commit = jest.fn()
      await actions.resetRecoverData({ commit })
      expect(commit).toHaveBeenCalledWith(`resetRecoverData`)
    })
  })
})
