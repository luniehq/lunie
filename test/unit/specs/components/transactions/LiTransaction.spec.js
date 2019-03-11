import { mount } from "@vue/test-utils"
import LiTransaction from "transactions/LiTransaction"

describe(`LiTransaction`, () => {
  let wrapper
  const propsData = {
    color: `#FFFFFF`,
    time: new Date(42000).toISOString(),
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

  it(`should show a transaction item`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`Should print the hour only if the same day`, () => {
    expect(LiTransaction.computed.date({ time: new Date(420000).toISOString() })).toEqual(
      `00:07:00`
    )
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(
      LiTransaction.computed.date({ time: new Date(4200000 + 999999999).toISOString() })
    ).toEqual(`Jan 12th 1970 14:56:39`)
  })
})
