import { mount } from "@vue/test-utils"
import TmLiStakeTransaction from "transactions/TmLiStakeTransaction"
import transactions from "../../store/json/txs"
import { state } from "renderer/connectors/lcdClientMock.js"

describe(`TmLiStakeTransaction`, () => {
  let wrapper
  let propsData = {
    transaction: transactions[3],
    validators: state.candidates,
    url: `/validator`,
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

    it(`should show the validator address if no validator with that address in store`, () => {
      wrapper.setProps({
        validators: []
      })
      expect(
        wrapper
          .text()
          .indexOf(
            `To cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`
          ) === -1
      ).toBe(true)
    })
  })

  describe(`unbonding delegations`, () => {
    it(`should show unbondings and calculate tokens from shares`, () => {
      wrapper.setProps({
        transaction: transactions[4],
        unbondingTime: Date.now() + 1000
      })
      expect(wrapper.vm.unbonding).toBe(true)
      expect(wrapper.contains(`.tx-unbonding__time-diff`)).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show unbonding delegations as ended`, () => {
      wrapper.setProps({
        transaction: transactions[4],
        unbondingTime: Date.now() - 1000
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should default to ended if no unbonding delegation is present`, () => {
      wrapper.setProps({
        transaction: transactions[4]
      })
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
