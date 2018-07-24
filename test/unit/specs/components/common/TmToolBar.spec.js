import setup from "../../../helpers/vuex-setup"
import TmToolBar from "common/TmToolBar"

describe("TmToolBar", () => {
  let wrapper, store, router
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmToolBar)
    router = instance.router
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

  it("goes back correctly and updates the state", () => {
    expect(router.currentRoute.fullPath).toBe("/")

    router.push("/staking")
    expect(store.state.user.history.length).toBe(1)
    expect(router.currentRoute.fullPath).toBe("/staking")

    wrapper.vm.back()
    expect(store.state.user.history.length).toBe(0)
    expect(router.currentRoute.fullPath).toBe("/")

    wrapper.vm.back()
    expect(store.state.user.history.length).toBe(0)
    expect(router.currentRoute.fullPath).toBe("/")
  })
})
