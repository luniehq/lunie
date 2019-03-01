import { mount } from "@vue/test-utils"
import LiTransaction from "transactions/LiTransaction"

describe(`LiTransaction`, () => {
  let wrapper
  const propsData = {
    color: `#FFFFFF`,
    time: Date.now(),
    block: 500
  }

  beforeEach(() => {
    wrapper = mount(LiTransaction, {
      propsData,
      slots: {
        caption: `<span>Some Caption</span>`,
        details: `<span>Some Details</span>`
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`Should print the hour only if the same day`, () => {
    expect(LiTransaction.computed.date({ time: Date.now() })).toEqual(
      `00:00:42`
    )
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(
      LiTransaction.computed.date({ time: Date.now() + 999999999 })
    ).toEqual(`Jan 12th 1970 13:47:21`)
  })
})
