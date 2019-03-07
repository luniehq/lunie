import { mount } from "@vue/test-utils"
import TmLiTransaction from "transactions/TmLiTransaction"

describe(`TmLiTransaction`, () => {
  let wrapper
  const propsData = {
    color: `#FFFFFF`,
    time: Date.now(),
    block: 500
  }

  beforeEach(() => {
    wrapper = mount(TmLiTransaction, {
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
    expect(TmLiTransaction.computed.date({
      time: Date.now()
    })).toEqual(
      `00:00:42`
    )
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(
      TmLiTransaction.computed.date({
        time: Date.now() + 999999999
      })
    ).toEqual(`Jan 12th 1970 13:47:21`)
  })
})
