import setup from "../../../helpers/vuex-setup"
import NiToolBar from "common/NiToolBar"

describe("NiToolBar", () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(NiToolBar)
    wrapper = instance.wrapper
    store = instance.store
  })

  it("has the expected html structure", () => {
    expect(wrapper.$el).toMatchSnapshot()
  })

  it("sets the helper modal", () => {
    wrapper.vm.enableModalHelp()
    expect(store.state.config.modals.help.active).toBe(true)
  })

  it("call dispatch to sign the user out", () => {
    wrapper.vm.signOut()
    expect(store.dispatch).toHaveBeenCalledWith("signOut")
  })
})
