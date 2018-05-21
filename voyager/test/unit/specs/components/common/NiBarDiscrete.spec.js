import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiBarDiscrete from "common/NiBarDiscrete"

describe("NiBarDiscrete", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiBarDiscrete)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
