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
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
