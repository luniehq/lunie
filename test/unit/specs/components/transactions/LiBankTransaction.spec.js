import { shallowMount } from "@vue/test-utils"
import LiBankTransaction from "transactions/LiBankTransaction"
import transactions from "../../store/json/txs"

describe(`LiBankTransaction`, () => {
  let wrapper
  const propsData = {
    devMode: true,
    transaction: transactions[0],
    address: `B`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })
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
      address: transactions[1].tx.value.msg[0].value.from_address
    })
    expect(wrapper.vm.sent).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show transactions sent to the sender`, () => {
    wrapper.setProps({
      transaction: transactions[2],
      address: `A`
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
