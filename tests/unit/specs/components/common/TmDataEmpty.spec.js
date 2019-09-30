import { mount } from "@vue/test-utils"
import TmDataEmpty from "common/TmDataEmpty"

describe(`TmDataEmpty`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(TmDataEmpty)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has an icon`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__icon i.material-icons`)
        .text()
        .trim()
    ).toBe(`info_outline`)
  })

  it(`has a title`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__title h4`)
        .text()
        .trim()
    ).toBe(`N/A`)
  })

  it(`has a subtitle`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__subtitle h5`)
        .text()
        .trim()
    ).toBe(`No data available yet.`)
  })
})
