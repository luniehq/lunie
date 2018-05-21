import setup from "../../../helpers/vuex-setup"
import AppFooter from "renderer/components/common/AppFooter"

describe("AppFooter", () => {
  let wrapper
  let instance = setup()

  beforeEach(() => {
    let test = instance.shallow(AppFooter)
    wrapper = test.wrapper
  })

  it("has the expected html structure if connected", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
