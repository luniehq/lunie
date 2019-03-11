import { shallowMount } from "@vue/test-utils"
import LiGovTransaction from "transactions/LiGovTransaction"
import { governanceTxs } from "../../store/json/txs"

describe(`LiGovTransaction`, () => {
  let wrapper
  const propsData = {
    transaction: governanceTxs[0],
    url: `/proposals`,
    bondingDenom: `stake`,
    txType: `cosmos-sdk/MsgSubmitProposal`
  }

  it(`proposals`, () => {
    wrapper = shallowMount(LiGovTransaction, { propsData, stubs: [`router-link`] })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`deposits`, () => {
    propsData.transaction = governanceTxs[1]
    propsData.txType = `cosmos-sdk/MsgDeposit`
    wrapper = shallowMount(LiGovTransaction, { propsData, stubs: [`router-link`] })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`votes`, () => {
    propsData.transaction = governanceTxs[2]
    propsData.txType = `cosmos-sdk/MsgVote`
    wrapper = shallowMount(LiGovTransaction, { propsData, stubs: [`router-link`] })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
