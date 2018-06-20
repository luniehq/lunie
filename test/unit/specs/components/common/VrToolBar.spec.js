import setup from "../../../helpers/vuex-setup"
import VrToolBar from "common/VrToolBar"

describe("VrToolBar", () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(VrToolBar)
    wrapper = instance.wrapper
    store = instance.store
  })

  it("has the expected html structure", () => {
    expect(wrapper.html()).toMatchSnapshot()
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
