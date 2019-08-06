import { shallowMount } from "@vue/test-utils"
import TransactionItem from "src/components/transactions/TransactionItem"

describe(`TransactionItem`, () => {
  let wrapper

  const tx = {
    blockNumber: 1086769,
    fees: {
      amount: "37",
      denom: "uatom"
    },
    group: "banking",
    key: "keyhash",
    memo: "(Sent via Lunie)",
    time: new Date("2019-07-31"),
    liquidDate: NaN,
    type: "cosmos-sdk/MsgSend"
  }

  beforeEach(() => {
    wrapper = shallowMount(TransactionItem, {
      propsData: {
        transaction: tx,
        validators: {},
        address: "cosmos1"
      }
    })
  })

  it(`renders a transaction item`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
