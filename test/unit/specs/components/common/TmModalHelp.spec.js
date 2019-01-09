import setup from "../../../helpers/vuex-setup"
import TmModalHelp from "common/TmModalHelp"

describe(`TmModalHelp`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmModalHelp)
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setModalHelp`, true)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should hide`, () => {
    wrapper.vm.close()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
