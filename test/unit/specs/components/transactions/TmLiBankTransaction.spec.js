import { shallowMount } from "@vue/test-utils"
import TmLiBankTransaction from "transactions/TmLiBankTransaction"
import transactions from "../../store/json/txs"

describe(`TmLiBankTransaction`, () => {
  let wrapper
  const propsData = {
    experimentalMode: true,
    transaction: transactions[0],
    address: `B`
  }

  beforeEach(() => {
    wrapper = shallowMount(TmLiBankTransaction, {
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
