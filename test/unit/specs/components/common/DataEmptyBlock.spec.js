import { mount } from "@vue/test-utils"
import DataEmptyBlock from "common/DataEmptyBlock"

describe(`DataEmptyBlock`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(DataEmptyBlock)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
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
        .find(`.tm-data-msg__title div`)
        .text()
        .trim()
    ).toBe(`No Transactions`)
  })

  it(`has a subtitle`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__subtitle div`)
        .text()
        .trim()
    ).toContain(`This block doesn't contain any transaction.`)
  })
})
