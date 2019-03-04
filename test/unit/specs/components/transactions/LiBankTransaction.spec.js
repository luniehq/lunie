import { shallowMount } from "@vue/test-utils"
import LiBankTransaction from "transactions/LiBankTransaction"
import { bankTxs } from "../../store/json/txs"

describe(`LiBankTransaction`, () => {
  let wrapper
  const propsData = {
    devMode: true,
    transaction: bankTxs[0],
    address: `cosmos1address`
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
      transaction: bankTxs[1],
      address: bankTxs[1].tx.value.msg[0].value.from_address
    })
    expect(wrapper.vm.sent).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show transactions sent to the sender`, () => {
    wrapper.setProps({
      transaction: bankTxs[2],
      address: `cosmos1address2`
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
