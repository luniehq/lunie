import { mount } from "@vue/test-utils"
import TmDataLoading from "common/TmDataLoading"

describe(`TmDataLoading`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(TmDataLoading)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has a title`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__title`)
        .text()
        .trim()
    ).toBe(`Data is loading…`)
  })

  it(`has a subtitle`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__subtitle`)
        .text()
        .trim()
    ).toBe(`Please wait a moment.`)
  })
})
