import { shallowMount } from "@vue/test-utils"
import LiBankTransaction from "transactions/LiBankTransaction"
import { bankTxs } from "../../store/json/txs"

describe(`LiBankTransaction`, () => {
  let wrapper
  const propsData = {
    tx: bankTxs[0].tx.value.msg[0].value,
    bondingDenom: `uatom`,
    address: ``,
    fees: {
      amount: `3421`,
      denom: `uatom`
    },
    time: new Date(Date.now()).toISOString(),
    block: 500,
    memo: `TESTING (Sent via Lunie)`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })
  })

  it(`should show bank transaction when user hasn't signed in`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show incoming transactions`, () => {
    wrapper.setProps({ address: `B` })

    expect(wrapper.vm.sent).toBe(false)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show outgoing transactions`, () => {
    wrapper.setProps({
      tx: bankTxs[1].tx.value.msg[0].value,
      address: bankTxs[1].tx.value.msg[0].value.from_address
    })

    expect(wrapper.vm.sent).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show outgoing transactions send to herself`, () => {
    wrapper.setProps({
      tx: bankTxs[2].tx.value.msg[0].value,
      address: `A`
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show a bank transaction without fees`, () => {
    wrapper.setProps({
      tx: bankTxs[2].tx.value.msg[0].value,
      address: `A`,
      fees: {
        amount: "0",
        denom: ""
      }
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
