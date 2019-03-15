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
    bondingDenom: `stake`
  }
  it(`create validator`, () => {
    wrapper = shallowMount(LiStakeTransaction, {
      propsData,
      stubs: [`router-link`]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`edit validator`, async () => {
    propsData.transaction = stakingTxs[1]
    propsData.txType = `cosmos-sdk/MsgEditValidator`

    wrapper = shallowMount(LiStakeTransaction, {
      propsData,
      stubs: [`router-link`]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`delegations`, () => {

    it(`should show delegations`, () => {
      propsData.transaction = stakingTxs[2]
      propsData.txType = `cosmos-sdk/MsgDelegate`

      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
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
    it(`should show unbondings and calculate tokens from shares`, () => {
      propsData.transaction = stakingTxs[3]
      propsData.txType = `cosmos-sdk/MsgUndelegate`
      propsData.unbondingTime = Date.now() + 1000
      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })

      expect(wrapper.contains(`.tx-unbonding__time-diff`)).toBe(true)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should show unbonding delegations as ended`, () => {
      propsData.transaction = stakingTxs[3]
      propsData.txType = `cosmos-sdk/MsgUndelegate`
      propsData.unbondingTime = Date.now() - 1000
      wrapper.setProps({ unbondingTime: Date.now() - 1000 })
      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.text()).toContain(`10,000.000000`)
    })

    it(`should default to ended if no unbonding delegation is present`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`redelegations`, () => {
    it(`should show redelegations and calculate tokens from shares`, () => {
      propsData.transaction = stakingTxs[4]
      propsData.txType = `cosmos-sdk/MsgBeginRedelegate`

      wrapper = shallowMount(LiStakeTransaction, {
        propsData,
        stubs: [`router-link`]
      })

      expect(wrapper.vm.$el).toMatchSnapshot()
      expect(wrapper.text()).toContain(`3`)
    })
  })

  it(`unjail validator`, () => {

    propsData.transaction = stakingTxs[5]
    propsData.txType = `cosmos-sdk/MsgUnjail`

    wrapper = shallowMount(LiStakeTransaction, {
      propsData,
      stubs: [`router-link`]
    })

    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
