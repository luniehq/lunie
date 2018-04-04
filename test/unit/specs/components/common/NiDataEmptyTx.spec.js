import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiDataEmptyTx from "common/NiDataEmptyTx"

describe("NiDataEmptyTx", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiDataEmptyTx)
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has an icon", () => {
    expect(
      wrapper
        .find(".ni-data-msg__icon i.material-icons")
        .text()
        .trim()
    ).toBe("info_outline")
  })

  it("has a title", () => {
    expect(
      wrapper
        .find(".ni-data-msg__title div")
        .text()
        .trim()
    ).toBe("No Transaction History")
  })

  it("has a subtitle", () => {
    expect(
      wrapper
        .find(".ni-data-msg__subtitle div")
        .text()
        .trim()
    ).toContain("Looks like you haven't sent or received any transactions yet.")
  })
})
