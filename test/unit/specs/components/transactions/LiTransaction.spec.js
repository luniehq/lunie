import { mount } from "@vue/test-utils"
import LiTransaction from "transactions/LiTransaction"

describe(`LiTransaction`, () => {
  let wrapper
  const propsData = {
    color: `#FFFFFF`,
    time: new Date(Date.now()).toISOString(),
    block: 500,
    memo: `TESTING (Sent via Lunie)`,
    fees: {
      amount: `3421`,
      denom: `uatom`
    }
  }
  const day = 86400000

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
    expect(
      LiTransaction.computed.date({ time: new Date(Date.now()).toISOString() })
    ).toEqual(`00:00:42`)
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(
      LiTransaction.computed.date({
        time: new Date(Date.now() - day * 2).toISOString()
      })
    ).toEqual(`Dec 30th 1969 00:00:42`)
  })
})
