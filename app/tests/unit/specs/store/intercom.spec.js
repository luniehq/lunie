import recoverModule from "src/vuex/modules/intercom.js"
jest.mock(`@capacitor-community/intercom`, () => ({}))

describe(`Module: Intercom`, () => {
  let module, state, actions, node

  const intercom = {
    registerUnidentifiedUser: jest.fn(),
    displayMessenger: jest.fn(),
  }

  const spydisplayMessenger = jest.spyOn(intercom, "displayMessenger")

  beforeEach(() => {
    node = {}
    module = recoverModule({ node })
    actions = module.actions
    state = { intercom, mobileApp: true }
  })

  describe(`actions`, () => {
    it(`should display Intercom Messenger`, async () => {
      await actions.displayMessenger({ state })
      expect(spydisplayMessenger).toHaveBeenCalled()
    })
  })
})
