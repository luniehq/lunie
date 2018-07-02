import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import TmSessionLoading from "common/TmSessionLoading"

describe("TmSessionLoading", () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TmSessionLoading)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
