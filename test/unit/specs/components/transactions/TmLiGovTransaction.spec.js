import { mount } from "@vue/test-utils"
import TmLiGovTransaction from "transactions/TmLiGovTransaction"
import transactions from "../../store/json/txs"

describe(`TmLiGovTransaction`, () => {
  let wrapper
  let propsData = {
    transaction: transactions[6],
    URL: `/proposals`,
    bondingDenom: `stake`
  }

  beforeEach(() => {
    wrapper = mount(TmLiGovTransaction, { propsData })
  })

  describe(`proposals`, () => {
    it(`should show proposals submission transactions`, () => {
      expect(wrapper.vm.propose).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`deposits`, () => {
    it(`should show deposits`, () => {
      wrapper.setProps({
        transaction: transactions[7]
      })
      expect(wrapper.vm.deposit).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })
})
