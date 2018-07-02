import setup from "../../../helpers/vuex-setup"
import TmModalReceive from "common/TmModalReceive"

describe("TmModalReceive", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmModalReceive)
    wrapper = instance.wrapper
    store = instance.store
    store.commit("setModalHelp", true)
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should hide", () => {
    wrapper.vm.close()
    wrapper.update()
    expect(store.commit).toHaveBeenCalledWith("setModalReceive", false)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
