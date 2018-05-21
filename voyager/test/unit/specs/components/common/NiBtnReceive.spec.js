import setup from "../../../helpers/vuex-setup"
import NiBtnReceive from "renderer/components/common/NiBtnReceive"

describe("NiBtnReceive", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(NiBtnReceive)
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
