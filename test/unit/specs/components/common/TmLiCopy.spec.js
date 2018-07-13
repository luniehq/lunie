import setup from "../../../helpers/vuex-setup"
import TmLiCopy from "common/TmLiCopy"

describe("TmLiCopy", () => {
  let wrapper
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TmLiCopy)
    wrapper = instance.wrapper
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
