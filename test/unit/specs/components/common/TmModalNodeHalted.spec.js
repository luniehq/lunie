import TmModalNodeHalted from "common/TmModalNodeHalted"
import setup from "../../../helpers/vuex-setup"

describe("TmModalNodeHalted", () => {
  let wrapper, store
  let { mount, localVue } = setup()

  beforeEach(() => {
    let instance = mount(TmModalNodeHalted)
    store = instance.store
    wrapper = instance.wrapper
  })

  it("has the expected html structure", () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("send a connection retry event", () => {
    let { ipcRenderer } = require("electron")
    wrapper.vm.switchNode()
    let spy = jest.spyOn(ipcRenderer, "send")
    expect(spy).toHaveBeenCalledWith("retry-connection")

    // also closing the modal
    expect(store.state.config.modals.nodeHalted.active).toBe(false)
  })

  it("should trigger waiting longer for blocks incoming", () => {
    wrapper.vm.wait()

    expect(store.dispatch).toHaveBeenCalledWith("checkNodeHalted")

    // also closing the modal
    expect(store.state.config.modals.nodeHalted.active).toBe(false)
  })
})
