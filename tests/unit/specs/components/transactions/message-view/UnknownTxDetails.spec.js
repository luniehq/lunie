import { shallowMount } from "@vue/test-utils"
import UnknownTxDetails from "src/components/transactions/message-view/UnknownTxDetails"

describe(`UnknownTxDetails`, () => {
  let wrapper

  const tx = {
    type: "UnknownTxDetails",
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
      blockExplorerLink:
        "https://awesome.blockexplorer.io/transactions/3CA728671B8078E71697B62237AD694052779F80B56880F6A6F1702F53EA3081",
    },
  }

  it(`renders a unstake transaction message`, () => {
    wrapper = shallowMount(UnknownTxDetails, {
      propsData: {
        transaction: tx,
        validators: {},
      },
      stubs: [`router-link`],
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
