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
    ).toEqual(`00:00`)
  })

  it(`should show a network fee`, () => {
    expect(wrapper.text()).toContain(`0.003`)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show a network fee of 0`, () => {
    wrapper.setProps({
      fees: {
        amount: "0",
        denom: "uatom"
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`Should print the datetime if we are in a different day`, () => {
    expect(
      LiTransaction.computed.date({
        time: new Date(Date.now() - day * 2).toISOString()
      })
    ).toEqual(`December 30th 1969 00:00`)
  })
})
