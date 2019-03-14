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
    fees: { uatom: 3421 }
  }
  describe(`create validator`, () => {
    it(`with fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData: Object.assign({}, propsData, { fees: null }),
        stubs: [`router-link`]
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`edit validator`, () => {
    beforeEach(() => {
      propsData.transaction = stakingTxs[1]
      propsData.txType = `cosmos-sdk/MsgEditValidator`
    })

    it(`with fees`, async () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData: Object.assign({}, propsData, { fees: null }),
        stubs: [`router-link`]
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`delegations`, () => {
    beforeEach(() => {
      propsData.transaction = stakingTxs[2]
      propsData.txType = `cosmos-sdk/MsgDelegate`
    })

    it(`with fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData: Object.assign({}, propsData, { fees: null }),
        stubs: [`router-link`]
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
      propsData.transaction = stakingTxs[3]
      propsData.txType = `cosmos-sdk/MsgUndelegate`
    })

    it(`with fees`, () => {
      propsData.unbondingTime = Date.now() + 1000
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })

      expect(wrapper.contains(`.tx-unbonding__time-diff`)).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData: Object.assign({}, propsData, { fees: null }),
        stubs: [`router-link`]
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show unbonding delegations as ended`, () => {
      propsData.unbondingTime = Date.now() - 1000
      wrapper.setProps({ unbondingTime: Date.now() - 1000 })
      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.text()).toContain(`1,000.0000000`)
    })

    it(`should default to ended if no unbonding delegation is present`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`redelegations`, () => {

    beforeEach(() => {
      propsData.transaction = stakingTxs[4]
      propsData.txType = `cosmos-sdk/MsgBeginRedelegate`
    })

    it(`with fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.text()).toContain(`3`)
    })

    it(`without fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData: Object.assign({}, propsData, { fees: null }),
        stubs: [`router-link`]
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`unjail`, () => {
    beforeEach(() => {
      propsData.transaction = stakingTxs[5]
      propsData.txType = `cosmos-sdk/MsgUnjail`
    })

    it(`with fees`, () => {
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`without fees`, () => {

      wrapper = shallowMount(LiStakeTransaction, {
        propsData: Object.assign({}, propsData, { fees: null }),
        stubs: [`router-link`]
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })
})
