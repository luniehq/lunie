import { shallowMount } from "@vue/test-utils"
import LiStakeTransaction from "transactions/LiStakeTransaction"
import { stakingTxs } from "../../store/json/txs"
import { state } from "renderer/connectors/lcdClientMock.js"

describe(`LiStakeTransaction`, () => {
  let wrapper
  const validators = state.candidates
  const propsData = {
    transaction: stakingTxs[0],
    txType: `cosmos-sdk/MsgCreateValidator`,
    validators,
    url: `/validator`,
    bondingDenom: `uatom`,
    fees: {
      amount: `3421`,
      denom: `uatom`
    }
  }

  beforeEach(() => {
    wrapper = shallowMount(LiStakeTransaction, { propsData, stubs: [`router-link`] })
  })

  describe(`create validator`, () => {

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

  describe(`edit validator`, () => {

    beforeEach(() => {
      wrapper.setProps({
        transaction: stakingTxs[1],
        txType: `cosmos-sdk/MsgEditValidator`,
        fees: {
          amount: `3421`,
          denom: `uatom`
        }
      })
    })

    it(`with fees`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper.setProps({
        fees: null
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`delegations`, () => {
    beforeEach(() => {
      wrapper.setProps({
        transaction: stakingTxs[2],
        txType: `cosmos-sdk/MsgDelegate`,
        fees: {
          amount: `3421`,
          denom: `uatom`
        }
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
    beforeEach(() => {
      wrapper.setProps({
        transaction: stakingTxs[3],
        txType: `cosmos-sdk/MsgUndelegate`,
        fees: {
          amount: `3421`,
          denom: `uatom`
        }
      })
    })

    it(`with fees`, () => {
      wrapper.setProps({
        unbondingTime: Date.now() + 1000
      })

      expect(wrapper.contains(`.tx-unbonding__time-diff`)).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper.setProps({
        fees: null
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show unbonding delegations as ended`, () => {
      wrapper.setProps({ unbondingTime: Date.now() - 1000 })
      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.text()).toContain(`0.000323`)
    })

    it(`should default to ended if no unbonding delegation is present`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`redelegations`, () => {

    beforeEach(() => {
      wrapper.setProps({
        transaction: stakingTxs[4],
        txType: `cosmos-sdk/MsgBeginRedelegate`,
        fees: {
          amount: `3421`,
          denom: `uatom`
        }
      })
    })

    it(`with fees`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.text()).toContain(`30.000000`)
    })

    it(`without fees`, () => {
      wrapper.setProps({
        fees: null
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`unjail`, () => {
    beforeEach(() => {
      wrapper.setProps({
        transaction: stakingTxs[5],
        txType: `cosmos-sdk/MsgUnjail`,
        fees: {
          amount: `3421`,
          denom: `uatom`
        }
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
})
