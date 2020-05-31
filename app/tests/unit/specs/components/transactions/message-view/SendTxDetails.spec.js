import { shallowMount } from "@vue/test-utils"
import SendTxDetails from "src/components/transactions/message-view/SendTxDetails"

describe(`SendTxDetails`, () => {
  let wrapper

  const tx = {
    type: "SendTx",
    hash: "3CA728671B8078E71697B62237AD694052779F80B56880F6A6F1702F53EA3081",
    height: 308453,
    timestamp: "2020-01-10T09:02:54Z",
    memo: "",
    success: true,
    fees: [
      {
        denom: "ATOM",
        amount: "0.00045",
      },
    ],
    details: {
      from: ["cosmosvaloper123"],
      to: ["cosmosvaloper456"],
      amount: {
        denom: "ATOM",
        amount: "10",
      },
    },
  }

  it(`renders a sent transaction message`, () => {
    wrapper = shallowMount(SendTxDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmosvaloper123",
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a received transaction message`, () => {
    wrapper = shallowMount(SendTxDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmosvaloper456",
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
