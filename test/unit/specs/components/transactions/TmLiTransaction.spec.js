import { mount } from "@vue/test-utils"
import TmLiTransaction from "transactions/TmLiTransaction"

describe(`TmLiTransaction`, () => {
  let wrapper
  const propsData = {
    color: `#FFFFFF`,
    time: 0,
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
    expect(TmLiTransaction.computed.date(Date.now())).toEqual(`00:00:42`)
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(TmLiTransaction.computed.date(Date.now() - 10000000)).toEqual(
      `00:00:42`
    )
  })
})
