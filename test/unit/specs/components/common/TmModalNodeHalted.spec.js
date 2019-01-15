import TmModalNodeHalted from "common/TmModalNodeHalted"
import setup from "../../../helpers/vuex-setup"

describe(`TmModalNodeHalted`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(TmModalNodeHalted)
    store = instance.store
    wrapper = instance.wrapper
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`send a connection retry event`, () => {
    const { ipcRenderer } = require(`electron`)
    wrapper.vm.switchNode()
    const spy = jest.spyOn(ipcRenderer, `send`)
    expect(spy).toHaveBeenCalledWith(`reconnect`)

    // also closing the modal
    expect(store.state.config.modals.nodeHalted.active).toBe(false)
  })
})
