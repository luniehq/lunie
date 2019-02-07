import { mount } from "@vue/test-utils"
import TmLiGovTransaction from "transactions/TmLiGovTransaction"
import transactions from "../../store/json/txs"

describe(`TmLiGovTransaction`, () => {
  let wrapper
  const propsData = {
    transaction: transactions[6],
    url: `/proposals`,
    bondingDenom: `stake`
  }

  beforeEach(() => {
    wrapper = mount(TmLiGovTransaction, { propsData, stubs: [`router-link`] })
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
