import { mount } from "@vue/test-utils"
import TmLiStakeTransaction from "transactions/TmLiStakeTransaction"
import transactions from "../../store/json/txs"

describe(`TmLiStakeTransaction`, () => {
  let wrapper
  let propsData = {
    transaction: transactions[3],
    validators: [
      {
        operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
        description: {
          moniker: `cool validator`
        },
        tokens: `100000`,
        delegator_shares: `100000`
      },
      {
        operator_address: `cosmosvaladdr157mg9hnhchfrqvk3enrvmvj29yhmlwf759xrgw`,
        description: {
          moniker: `Kentucky val`
        },
        tokens: `20`,
        delegator_shares: `100`
      }
    ],
    URL: `/validator`,
    bondingDenom: `stake`
  }

  beforeEach(() => {
    wrapper = mount(TmLiStakeTransaction, { propsData, stubs: [`router-link`] })
  })

  describe(`delegations`, () => {
    it(`should show delegations`, () => {
      expect(wrapper.vm.delegation).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`unbonding delegations`, () => {
    it(`should show unbondings and calculate tokens from shares`, () => {
      wrapper.setProps({
        transaction: transactions[4]
      })
      expect(wrapper.vm.unbonding).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`redelegations`, () => {
    it(`should show redelegations and calculate tokens from shares`, () => {
      wrapper.setProps({
        transaction: transactions[5]
      })
      expect(wrapper.vm.redelegation).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })
})
