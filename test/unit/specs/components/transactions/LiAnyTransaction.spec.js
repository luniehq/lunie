import { shallowMount } from "@vue/test-utils"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import transactions from "../../store/json/txs"

describe(`LiAnyTransaction`, () => {
  let wrapper
  const validators = [
    { operator_address: `cosmosvaloper1address1` },
    { operator_address: `cosmosvaloper1address2` }
  ]
  const propsData = {
    transaction: transactions[0],
    validators,
    address: `cosmos1address`,
    bondingDenom: `atom`,
    validatorsUrl: `/validators`
  }

  beforeEach(() => {
    wrapper = shallowMount(LiAnyTransaction, {
      propsData,
      stubs: [`router-link`]
    })
  })

  it(`shows bank transactions`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows staking transactions`, () => {
    wrapper.setProps({
      transaction: transactions[3]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows governance transactions`, () => {
    wrapper.setProps({
      transaction: transactions[3]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows distributions transactions`, () => {
    wrapper.setProps({
      transaction: transactions[3]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows unknown type transactions`, () => {
    const unknownTx = JSON.parse(JSON.stringify(transactions[0]))
    unknownTx.tx.value.msg[0].type = `UNKNOWN`
    wrapper.setProps({
      transaction: unknownTx
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
