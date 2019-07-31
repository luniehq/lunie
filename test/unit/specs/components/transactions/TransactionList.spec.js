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
      time: "Thu Jul 18 2019 12:03:11 GMT+0200 (Central European Summer Time)",
      timeDiff: NaN,
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

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
