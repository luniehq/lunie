import { shallowMount } from "@vue/test-utils"
import TransactionDetails from "src/components/transactions/TransactionDetails"

describe(`TransactionDetails`, () => {
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
    wrapper = shallowMount(TransactionDetails, {
      propsData: {
        transaction: tx,
        validators: {},
        address: "cosmos1"
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
