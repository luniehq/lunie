import setup from "../../../helpers/vuex-setup"
import NiLiCopy from "common/NiLiCopy"

describe("NiLiCopy", () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(NiLiCopy)
    wrapper = instance.wrapper
    store = instance.store
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the provided value", () => {
    wrapper.setProps({ value: "HALLO" })
    expect(wrapper.html()).toContain("HALLO")
  })

  it("should show the receive button", () => {
    wrapper.setProps({ value: "HALLO", receive: true })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
