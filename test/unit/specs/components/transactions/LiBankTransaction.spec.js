import { shallowMount } from "@vue/test-utils"
import LiBankTransaction from "transactions/LiBankTransaction"
import { bankTxs } from "../../store/json/txs"

describe(`LiBankTransaction`, () => {
  let wrapper
  const propsData = {
    transaction: bankTxs[0],
    bondingDenom: `uatom`,
    address: ``,
    fees: {
      amount: `3421`,
      denom: `uatom`
    }
  }

  it(`should show bank transaction when user hasn't signed in`, () => {
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show incoming transactions`, () => {
    propsData.address = `B`
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })

    expect(wrapper.vm.sent).toBe(false)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show outgoing transactions`, () => {
    propsData.transaction = bankTxs[1]
    propsData.address = bankTxs[1].tx.value.msg[0].value.from_address
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })

    expect(wrapper.vm.sent).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show outgoing transactions send to herself`, () => {
    propsData.transaction = bankTxs[2]
    propsData.address = `A`
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show a bank transaction without fees`, () => {
    propsData.transaction = bankTxs[2]
    propsData.address = `A`
    wrapper = shallowMount(LiBankTransaction, {
      propsData: Object.assign({}, propsData, { fees: null }),
      stubs: [`router-link`]
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

})
