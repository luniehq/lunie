import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import TmDataEmptySearch from "common/TmDataEmptySearch"

describe("TmDataEmptySearch", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(TmDataEmptySearch)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has an icon", () => {
    expect(
      wrapper
        .find(".tm-data-msg__icon i.material-icons")
        .text()
        .trim()
    ).toBe("search")
  })

  it("has a title", () => {
    expect(
      wrapper
        .find(".tm-data-msg__title div")
        .text()
        .trim()
    ).toBe("No Results")
  })

  it("has a subtitle", () => {
    expect(
      wrapper
        .find(".tm-data-msg__subtitle div")
        .text()
        .trim()
    ).toBe("Your search did not match any available data.")
  })
})
