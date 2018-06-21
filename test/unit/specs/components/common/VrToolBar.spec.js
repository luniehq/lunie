import setup from "../../../helpers/vuex-setup"
import VrToolBar from "common/VrToolBar"

describe("VrToolBar", () => {
  let wrapper, store, instance
  let { mount } = setup()

  beforeEach(() => {
    instance = mount(VrToolBar)
    wrapper = instance.wrapper
    store = instance.store
    wrapper.update()
  })

  it("has the expected html structure", () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it("sets the helper modal", () => {
    wrapper.vm.enableModalHelp()
    wrapper.update()
    expect(store.state.config.modals.help.active).toBe(true)
  })

  it("call dispatch to sign the user out", () => {
    wrapper.vm.signOut()
    wrapper.update()
    expect(store.dispatch).toHaveBeenCalledWith("signOut")
  })
})
