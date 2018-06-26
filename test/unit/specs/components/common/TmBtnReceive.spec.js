import setup from "../../../helpers/vuex-setup"
import TmBtnReceive from "renderer/components/common/TmBtnReceive"

describe("TmBtnReceive", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmBtnReceive)
    wrapper = instance.wrapper
    store = instance.store
  })

  it("has the expected html structure", () => {
    expect(wrapper.html()).toMatchSnapshot()
  })

  it("should commit the receive modal", () => {
    wrapper.vm.openModal()
    expect(store.commit).toHaveBeenCalledWith("setModalReceive", true)
  })
})
