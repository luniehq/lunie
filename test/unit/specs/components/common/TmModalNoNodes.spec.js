import TmModalNoNodes from "common/TmModalNoNodes"
import setup from "../../../helpers/vuex-setup"

describe("TmModalNoNodes", () => {
  let wrapper, store
  let { mount, localVue } = setup()

  beforeEach(() => {
    let instance = mount(TmModalNoNodes)
    store = instance.store
    wrapper = instance.wrapper
  })

  it("has the expected html structure", () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("send a connection retry event", () => {
    let { ipcRenderer } = require("electron")
    wrapper.vm.retry()
    let spy = jest.spyOn(ipcRenderer, "send")
    expect(spy).toHaveBeenCalledWith("retry-connection")

    // also closing the modal
    expect(store.state.config.modals.nonodes.active).toBe(false)
  })

  it("switches to a mock connection", () => {
    wrapper.vm.useMock()

    expect(store.state.node.mocked).toBe(true)

    // also closing the modal
    expect(store.state.config.modals.nonodes.active).toBe(false)
  })
})
