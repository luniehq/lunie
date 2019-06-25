import { shallowMount } from "@vue/test-utils"
import LiStakeTransaction from "transactions/LiStakeTransaction"
import { stakingTxs } from "../../store/json/txs"
import { state } from "test/unit/helpers/mockValues.js"

describe(`LiStakeTransaction`, () => {
  let wrapper
  const validators = state.candidates
  const propsData = {
    tx: stakingTxs[0].tx.value.msg[0].value,
    txType: `cosmos-sdk/MsgCreateValidator`,
    validators,
    url: `/validator`,
    bondingDenom: `uatom`,
    fees: {
      amount: `3421`,
      denom: `uatom`
    },
    time: new Date(Date.now()).toISOString(),
    block: 500,
    memo: `TESTING (Sent via Lunie)`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiStakeTransaction, {
      propsData,
      stubs: [`router-link`]
    })
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
        tx: stakingTxs[1].tx.value.msg[0].value,
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
        tx: stakingTxs[2].tx.value.msg[0].value,
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
        tx: stakingTxs[3].tx.value.msg[0].value,
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
        fees: {
          amount: "0",
          denom: ""
        }
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show unbonding delegations as ended`, () => {
      wrapper.setProps({ unbondingTime: Date.now() - 1000 })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should default to ended if no unbonding delegation is present`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`redelegations`, () => {
    beforeEach(() => {
      wrapper.setProps({
        tx: stakingTxs[4].tx.value.msg[0].value,
        txType: `cosmos-sdk/MsgBeginRedelegate`,
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
        fees: {
          amount: "0",
          denom: ""
        }
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`unjail`, () => {
    beforeEach(() => {
      wrapper.setProps({
        tx: stakingTxs[5].tx.value.msg[0].value,
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
