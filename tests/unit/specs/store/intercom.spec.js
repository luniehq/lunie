import recoverModule from "src/vuex/modules/intercom.js"

describe(`Module: Intercom`, () => {
  let module, state, actions, mutations, node

  const intercom = {
    displayMessenger: jest.fn(),
    displayHelpCenter: jest.fn()
  }

  const spydisplayMessenger = jest.spyOn(intercom, "displayMessenger")
  const spydisplayHelpCenter = jest.spyOn(intercom, "displayHelpCenter")

  beforeEach(() => {
    node = {}
    module = recoverModule({ node })
    state = { intercom }
    actions = module.actions
    mutations = module.mutations
  })

  describe(`mutations`, () => {
    it(`should display Intercom Messenger`, () => {
      mutations.displayMessenger(state)
      expect(spydisplayMessenger).toHaveBeenCalled()
    })
    it(`should display Help Center`, () => {
      mutations.displayHelpCenter(state)
      expect(spydisplayHelpCenter).toHaveBeenCalled()
    })
  })

  describe(`actions`, () => {
    it(`should display Intercom Messenger`, async () => {
      const commit = jest.fn()
      await actions.displayMessenger({ commit })
      expect(commit).toHaveBeenCalledWith(`displayMessenger`)
    })
    it(`should display Help Center`, async () => {
      const commit = jest.fn()
      await actions.displayHelpCenter({ commit })
      expect(commit).toHaveBeenCalledWith(`displayHelpCenter`)
    })
  })
})
