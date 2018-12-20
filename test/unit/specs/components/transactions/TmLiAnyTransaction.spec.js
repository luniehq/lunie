import { mount } from "@vue/test-utils"
import TmLiAnyTransaction from "transactions/TmLiAnyTransaction"
import transactions from "../../store/json/txs"

describe(`TmLiAnyTransaction`, () => {
  let wrapper
  let propsData = {
    transaction: transactions[0],
    validators: [
      {
        operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
        description: {
          moniker: `cool validator`
        },
        tokens: `100000`,
        delegator_shares: `100000`
      },
      {
        operator_address: `cosmosvaladdr157mg9hnhchfrqvk3enrvmvj29yhmlwf759xrgw`,
        description: {
          moniker: `Kentucky val`
        },
        tokens: `100`,
        delegator_shares: `20`
      }
    ],
    address: `tb1da6xsetjg9jxgun9wdesexv05j`,
    bondingDenom: `atom`
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
    let unknownTx = JSON.parse(JSON.stringify(transactions[0]))
    unknownTx.tx.value.msg[0].type = `UNKNOWN`
    wrapper.setProps({
      transaction: unknownTx
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
