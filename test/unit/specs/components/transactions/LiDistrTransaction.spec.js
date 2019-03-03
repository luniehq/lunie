import { shallowMount } from "@vue/test-utils"
import LiDistrTransaction from "transactions/LiDistrTransaction"
import transactions from "../../store/json/txs"

describe(`LiDistrTransaction`, () => {
  let wrapper
  const propsData = {
    transaction: transactions[6],
    url: `/proposals`,
    bondingDenom: `stake`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiDistrTransaction, { propsData, stubs: [`router-link`] })
  })

  it(`withdraw delegation rewards`, () => {
    expect(wrapper.vm.propose).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`set withdraw address`, () => {
    wrapper.setProps({
      transaction: transactions[7]
    })

    expect(wrapper.vm.deposit).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`withdraw validator commission`, () => {
    wrapper.setProps({
      transaction: transactions[7]
    })

    expect(wrapper.vm.deposit).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
