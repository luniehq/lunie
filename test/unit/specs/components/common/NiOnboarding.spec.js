import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiOnboarding from "common/NiOnboarding"

describe("NiOnboarding", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiOnboarding)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
