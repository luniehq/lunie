import { shallowMount } from "@vue/test-utils"
import TmLiBankTransaction from "transactions/TmLiBankTransaction"
import transactions from "../../store/json/txs"

describe(`TmLiBankTransaction`, () => {
  let wrapper
  let propsData = {
    devMode: true,
    transaction: transactions[0],
    address: `tb1d4u5zerywfjhxuc9nudvw`
  }

  beforeEach(() => {
    wrapper = shallowMount(TmLiBankTransaction, { propsData })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show incoming transactions`, () => {
    expect(wrapper.vm.sent).toBe(false)
  })

  it(`should show outgoing transactions`, () => {
    wrapper.setProps({
      transaction: transactions[1],
      address: `tb1d4u5zerywfjhxuc9nudvw`
    })
    expect(wrapper.vm.sent).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show transactions sent to the sender`, () => {
    wrapper.setProps({
      transaction: transactions[2],
      address: `tb1d4u5zerywfjhxuc9nudvw`
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
