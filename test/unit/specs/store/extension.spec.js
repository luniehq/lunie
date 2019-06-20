import extensionModule from "src/vuex/modules/extension.js"

describe(`Module: Extension`, () => {
  let module, state, mutations, node

  beforeEach(() => {
    node = {}
    module = extensionModule({ node })
    state = module.state
    mutations = module.mutations
  })

  it(`should default to signed out state`, () => {
    expect(state.enabled).toBe(false)
  })

  describe(`mutations`, () => {
    it(`should set extension`, () => {
      expect(state.enabled).toBe(false)
      mutations.setExtensionAvailable(state, true)
      expect(state.enabled).toBe(true)
      mutations.setExtensionAvailable(state, false)
      expect(state.enabled).toBe(false)
    })
  })
})
