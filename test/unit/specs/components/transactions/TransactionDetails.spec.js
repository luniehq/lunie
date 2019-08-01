import { shallowMount } from "@vue/test-utils"
import TransactionDetails from "src/components/transactions/TransactionDetails"

describe(`TransactionDetails`, () => {
  let wrapper

  const tx = {
    type: "cosmos-sdk/MsgSend",
    value: {
      from_address: "cosmos1",
      to_address: "cosmos2",
      amount: [{ denom: "fabocoins", amount: "1234" }]
    },
    key:
      'cosmos-sdk/MsgSend_undefined_{"from_address":"cosmos1","to_address":"cosmos2","amount":[{"denom":"fabocoins","amount":"1234"}]}',
    blockNumber: 150,
    time: new Date("2018-07-01"),
    fees: { amount: "0", denom: "ATOM" },
    group: "banking",
    liquidDate: null
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
