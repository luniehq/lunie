import { shallowMount } from "@vue/test-utils"
import VoteTxDetails from "src/components/transactions/message-view/VoteTxDetails"

describe(`VoteTxDetails`, () => {
  let wrapper

  const tx = {
    type: "VoteTx",
    hash: "A0DEB29E97A4DF38289D55D63C5724588985E1D35B26518CB66EAF96CFEF2E04",
    height: 779965,
    timestamp: "2020-02-10T10:15:51Z",
    memo: "",
    success: true,
    fees: [],
    details: {
      proposalId: 17,
      voteOption: "Yes",
    },
  }

  it(`renders a vote transaction message`, () => {
    wrapper = shallowMount(VoteTxDetails, {
      propsData: {
        transaction: tx,
        validators: {},
      },
      stubs: [`router-link`],
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
