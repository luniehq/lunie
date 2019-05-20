import { shallowMount } from "@vue/test-utils"
import LiAnyTransaction from "transactions/LiAnyTransaction"
import {
  bankTxs,
  stakingTxs,
  governanceTxs,
  distributionTxs
} from "../../store/json/txs.js"

describe(`LiAnyTransaction`, () => {
  let wrapper
  const validators = [
    { operator_address: `cosmosvaloper1address1`, moniker: `david` },
    { operator_address: `cosmosvaloper1address2`, moniker: `billy` }
  ]
  const propsData = {
    transaction: bankTxs[0],
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
      transaction: stakingTxs[0]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows governance transactions`, () => {
    wrapper.setProps({
      transaction: governanceTxs[0]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows distribution transaction with multiple msgs`, () => {
    wrapper.setProps({
      transaction: distributionTxs[0]
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows unknown type transactions`, () => {
    const unknownTx = JSON.parse(JSON.stringify(bankTxs[0]))
    unknownTx.tx.value.msg[0].type = `UNKNOWN`
    wrapper.setProps({
      transaction: unknownTx
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`returns default fee object when no fee present`, () => {
    const propsNoFee = {
      bondingDenom: "atom",
      transaction: {
        tx: {
          value: {
            fee: undefined
          }
        }
      }
    }
    expect(LiAnyTransaction.computed.fees.call(propsNoFee)).toEqual({
      amount: "0",
      denom: "atom"
    })
  })

  it(`returns correct fee object`, () => {
    const propswithFee = {
      bondingDenom: "othertype",
      transaction: {
        tx: {
          value: {
            fee: {
              amount: [
                {
                  amount: "123",
                  denom: "atom"
                }
              ]
            }
          }
        }
      }
    }
    expect(LiAnyTransaction.computed.fees.call(propswithFee)).toEqual({
      amount: "123",
      denom: "atom"
    })
  })
})
