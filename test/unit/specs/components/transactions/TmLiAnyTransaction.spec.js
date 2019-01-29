import { mount } from "@vue/test-utils"
import TmLiAnyTransaction from "transactions/TmLiAnyTransaction"
import transactions from "../../store/json/txs"
import { state } from "renderer/connectors/lcdClientMock.js"

describe(`TmLiAnyTransaction`, () => {
  let wrapper
  const propsData = {
    transaction: transactions[0],
    validators: state.candidates,
    address: `tb1da6xsetjg9jxgun9wdesexv05j`,
    bondingDenom: `atom`,
    validatorsUrl: `/validators`
  }

  beforeEach(() => {
    wrapper = mount(TmLiAnyTransaction, {
      propsData
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
