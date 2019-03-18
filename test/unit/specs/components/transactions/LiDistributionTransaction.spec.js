import { shallowMount } from "@vue/test-utils"
import LiDistributionTransaction from "transactions/LiDistributionTransaction"
import { distributionTxs } from "../../store/json/txs"

describe(`LiDistributionTransaction`, () => {
  let wrapper
  const validators = [
    { operator_address: `cosmosvaloper1address1`, moniker: `david` },
    { operator_address: `cosmosvaloper1address2`, moniker: `billy` }
  ]
  const propsData = {
    transaction: distributionTxs[0],
    url: `/validator`,
    validators,
    bondingDenom: `uatom`,
    fees: {
      amount: `3421`,
      denom: `uatom`
    },
    txType: `cosmos-sdk/MsgWithdrawDelegationReward`,
  }

  beforeEach(() => {
    wrapper = shallowMount(LiDistributionTransaction, { propsData, stubs: [`router-link`] })
  })

  describe(`withdraw delegation rewards`, () => {
    it(`with fees`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper.setProps({
        fees: null
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`set withdraw address`, () => {
    beforeEach(() => {
      wrapper.setProps({
        transaction: distributionTxs[1],
        txType: `cosmos-sdk/MsgSetWithdrawAddress`
      })
    })
    it(`with fees`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper.setProps({
        fees: null
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`withdraw validator commission`, () => {

    beforeEach(() => {
      wrapper.setProps({
        transaction: distributionTxs[2],
        txType: `cosmos-sdk/MsgWithdrawValidatorCommission`
      })
      it(`with fees`, () => {
        expect(wrapper.vm.$el).toMatchSnapshot()
      })

      it(`without fees`, () => {
        wrapper.setProps({
          fees: null
        })
        expect(wrapper.vm.$el).toMatchSnapshot()
      })
    })
  })
})
