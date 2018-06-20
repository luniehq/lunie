import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import NiDataLoading from "common/NiDataLoading"

describe("NiDataLoading", () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(NiDataLoading)
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
    ).toBe("rotate_right")
  })

  it("has a spinning icon", () => {
    expect(
      wrapper.find(".tm-data-msg__icon").contains("i.material-icons.fa-spin")
    ).toBe(true)
  })

  it("has a title", () => {
    expect(
      wrapper
        .find(".tm-data-msg__title div")
        .text()
        .trim()
    ).toBe("Data is loading…")
  })

  it("has a subtitle", () => {
    expect(
      wrapper
        .find(".tm-data-msg__subtitle div")
        .text()
        .trim()
    ).toBe("Please wait a moment.")
  })
})
