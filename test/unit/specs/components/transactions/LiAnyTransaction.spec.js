import { mount } from "@vue/test-utils"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import transactions from "../../store/json/txs"
import { state } from "renderer/connectors/lcdClientMock.js"

describe(`LiAnyTransaction`, () => {
  let wrapper
  const propsData = {
    transaction: transactions[0],
    validators: state.candidates,
    address: `A`,
    bondingDenom: `atom`,
    validatorsUrl: `/validators`
  }

  beforeEach(() => {
    wrapper = mount(LiAnyTransaction, {
      propsData,
      stubs: [`router-link`]
    })
  })

  it(`shows bank transactions`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows stake transactions`, () => {
    wrapper.setProps({
      transaction: transactions[3]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows unknown transactions`, () => {
    const unknownTx = JSON.parse(JSON.stringify(transactions[0]))
    unknownTx.tx.value.msg[0].type = `UNKNOWN`
    wrapper.setProps({
      transaction: unknownTx
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
