import { shallowMount } from "@vue/test-utils"
import DepositTxDetails from "src/components/transactions/message-view/DepositTxDetails"

describe(`DepositTxDetails`, () => {
  let wrapper

  const tx = {
    type: "DepositTx",
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
      proposalId: 1,
      amount: {
        denom: "ATOM",
        amount: "10",
      },
    },
  }

  it(`renders a deposit transaction message`, () => {
    wrapper = shallowMount(DepositTxDetails, {
      propsData: {
        transaction: tx,
        validators: {},
      },
      stubs: [`router-link`],
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
