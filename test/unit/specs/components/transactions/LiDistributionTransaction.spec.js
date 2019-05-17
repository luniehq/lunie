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
    tx: {},
    url: `/validator`,
    validators,
    bondingDenom: `uatom`,
    fees: {
      amount: `3421`,
      denom: `uatom`
    },
    txType: ``,
    time: new Date(Date.now()).toISOString(),
    block: 500,
    memo: `TESTING (Sent via Lunie)`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiDistributionTransaction, {
      propsData,
      stubs: [`router-link`]
    })
  })

  it(`withdraw delegation rewards`, () => {
    wrapper.setProps({
      tx: distributionTxs[0].tx.value.msg[0].value,
      txType: `cosmos-sdk/MsgWithdrawDelegationReward`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`set withdraw address`, () => {
    wrapper.setProps({
      tx: distributionTxs[1].tx.value.msg[0].value,
      txType: `cosmos-sdk/MsgSetWithdrawAddress`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`withdraw validator commission`, () => {
    wrapper.setProps({
      tx: distributionTxs[2].tx.value.msg[0].value,
      txType: `cosmos-sdk/MsgWithdrawValidatorCommission`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`transaction without fees`, () => {
    wrapper.setProps({
      tx: distributionTxs[0].tx.value.msg[0].value,
      txType: `cosmos-sdk/MsgWithdrawDelegationReward`,
      fees: {
        amount: "0",
        denom: ""
      }
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
