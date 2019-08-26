import { mount } from "@vue/test-utils"
import TmDataEmptyTx from "common/TmDataEmptyTx"

describe(`TmDataEmptyTx`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(TmDataEmptyTx, {
      stubs: {
        "router-link": true
      }
    })
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
    ).toBe(`receipt`)
  })

  it(`has a title`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__title div`)
        .text()
        .trim()
    ).toBe(`No Transaction History`)
  })

  it(`has a subtitle`, () => {
    expect(
      wrapper
        .find(`.tm-data-msg__subtitle div`)
        .text()
        .trim()
    ).toContain(
      `Looks like there are no transactions associated with this address yet.`
    )
  })
})
