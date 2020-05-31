import { shallowMount } from "@vue/test-utils"
import RestakeTxDetails from "src/components/transactions/message-view/RestakeTxDetails"

describe(`RestakeTxDetails`, () => {
  let wrapper

  const tx = {
    type: "RestakeTx",
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
      from: ["cosmosvaloper1qecshyc40kshszkwrtscgmsdd8tz3n4hrj9yf2"],
      to: ["cosmosvaloper18ymm350peujvq2xy9ymyqj4v34ekvnk3tsekuz"],
      amount: {
        denom: "ATOM",
        amount: "10",
      },
    },
  }

  it(`renders a restake transaction message`, () => {
    wrapper = shallowMount(RestakeTxDetails, {
      propsData: {
        transaction: tx,
        validators: {},
      },
      stubs: [`router-link`],
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
