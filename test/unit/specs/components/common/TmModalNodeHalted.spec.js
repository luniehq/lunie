import TmModalNodeHalted from "common/TmModalNodeHalted"
import setup from "../../../helpers/vuex-setup"

describe(`TmModalNodeHalted`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmModalNodeHalted)
    store = instance.store
    wrapper = instance.wrapper
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.html()).not.toBeUndefined()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`switches to a mock connection`, () => {
    wrapper.vm.useMock()

    expect(store.state.connection.mocked).toBe(true)

    // also closing the modal
    expect(store.state.config.modals.nodeHalted.active).toBe(false)
  })
})
