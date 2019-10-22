import { shallowMount } from "@vue/test-utils"
import TransactionList from "src/components/transactions/TransactionList"

describe(`TransactionList`, () => {
  let wrapper

  const transactions = [
    {
      height: 1086769,
      fee: {
        amount: "3.7",
        denom: "atom"
      },
      group: "banking",
      key: "keyhash",
      memo: "(Sent via Lunie)",
      tiemstamp: new Date("2019-07-31"),
      liquidDate: null,
      type: "cosmos-sdk/MsgSend"
    },
    {
      height: 1086769,
      fee: {
        amount: "3.7",
        denom: "atom"
      },
      group: "banking",
      key: "keyhash2",
      memo: "(Sent via Lunie)",
      tiemstamp: new Date("1970-01-01"),
      liquidDate: null,
      type: "cosmos-sdk/MsgSend"
    },
    {
      height: 1086769,
      fee: {
        amount: "3.7",
        denom: "atom"
      },
      group: "banking",
      key: "keyhash3",
      memo: "(Sent via Lunie)",
      tiemstamp: new Date("2019-07-31"),
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
