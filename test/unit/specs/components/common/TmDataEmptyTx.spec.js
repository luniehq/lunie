import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import TmDataEmptyTx from "common/TmDataEmptyTx"

describe("TmDataEmptyTx", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(TmDataEmptyTx)
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
    ).toBe("info_outline")
  })

  it("has a title", () => {
    expect(
      wrapper
        .find(".tm-data-msg__title div")
        .text()
        .trim()
    ).toBe("No Transaction History")
  })

  it("has a subtitle", () => {
    expect(
      wrapper
        .find(".tm-data-msg__subtitle div")
        .text()
        .trim()
    ).toContain("Looks like you haven't sent or received any transactions yet.")
  })
})
