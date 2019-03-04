import { shallowMount } from "@vue/test-utils"
import LiDistrTransaction from "transactions/LiDistrTransaction"
import { distributionTxs } from "../../store/json/txs"

describe(`LiDistrTransaction`, () => {
  let wrapper
  const validators = [
    { operator_address: `cosmosvaloper1address1`, moniker: `david` },
    { operator_address: `cosmosvaloper1address2`, moniker: `billy` }
  ]
  const propsData = {
    transaction: distributionTxs[0],
    url: `/validator`,
    validators,
    bondingDenom: `stake`,
    txType: `cosmos-sdk/MsgWithdrawDelegationReward`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiDistrTransaction, { propsData, stubs: [`router-link`] })
  })

  it(`withdraw delegation rewards`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`set withdraw address`, () => {
    wrapper.setProps({
      transaction: distributionTxs[1],
      txType: `cosmos-sdk/MsgSetWithdrawAddress`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`withdraw validator commission`, () => {
    wrapper.setProps({
      transaction: distributionTxs[2],
      txType: `cosmos-sdk/MsgWithdrawValidatorCommission`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
