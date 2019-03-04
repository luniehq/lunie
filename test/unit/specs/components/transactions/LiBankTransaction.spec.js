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

  })

  it(`has the expected html structure`, () => {
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show incoming transactions`, () => {
    expect(wrapper.vm.sent).toBe(false)
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

  it(`should show transactions sent to the sender`, () => {
    propsData.transaction = bankTxs[2]
    propsData.address = `A`
    wrapper = shallowMount(LiBankTransaction, {
      propsData,
      stubs: [`router-link`]
    })
    expect(wrapper.vm.sentSelf).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
