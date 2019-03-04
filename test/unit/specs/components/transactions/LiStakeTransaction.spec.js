import { shallowMount } from "@vue/test-utils"
import LiStakeTransaction from "transactions/LiStakeTransaction"
import { stakingTxs } from "../../store/json/txs"

describe(`LiStakeTransaction`, () => {
  let wrapper
  const validators = [
    { operator_address: `cosmosvaloper1address1`, description: { moniker: `david` } },
    { operator_address: `cosmosvaloper1address2`, description: { moniker: `billy` } }
  ]
  const propsData = {
    transaction: stakingTxs[0],
    txType: `cosmos-sdk/MsgCreateValidator`,
    validators,
    url: `/validator`,
    bondingDenom: `stake`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiStakeTransaction, {
      propsData,
      stubs: [`router-link`]
    })
  })

  it(`create validator`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`edit validator`, async () => {
    wrapper.setProps({
      transaction: stakingTxs[1],
      txType: `cosmos-sdk/MsgDelegate`,
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`delegations`, () => {
    beforeEach(() => {
      wrapper.setProps({
        transaction: stakingTxs[2],
        txType: `cosmos-sdk/MsgDelegate`,
      })
    })

    it(`should show delegations`, () => {
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
        txType: `cosmos-sdk/Undelegate`,
      })
    })

    it(`should show unbondings and calculate tokens from shares`, () => {
      wrapper.setProps({ unbondingTime: Date.now() + 1000 })
      expect(wrapper.contains(`.tx-unbonding__time-diff`)).toBe(true)
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
    it(`should show redelegations and calculate tokens from shares`, async () => {
      wrapper.setProps({
        transaction: stakingTxs[4],
        txType: `cosmos-sdk/BeginRedelegate`
      })
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`unjail validator`, async () => {
    wrapper.setProps({
      transaction: stakingTxs[5],
      txType: `cosmos-sdk/MsgUnjail`,
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
