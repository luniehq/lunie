import { shallowMount } from "@vue/test-utils"
import TransactionList from "src/components/transactions/TransactionList"

describe(`TransactionList`, () => {
  let wrapper

  const transactions = [
    {
      blockNumber: 1086769,
      fees: {
        amount: "37",
        denom: "uatom"
      },
      group: "banking",
      key: "keyhash",
      memo: "(Sent via Lunie)",
      time: new Date("2019-07-31"),
      liquidDate: null,
      type: "cosmos-sdk/MsgSend"
    }
  ]

  beforeEach(() => {
    wrapper = shallowMount(TransactionList, {
      propsData: {
        transactions: transactions,
        validators: {},
        address: "cosmos1"
      }
    })
  })

  it(`renders a list of TransactionItems`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
