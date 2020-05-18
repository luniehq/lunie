import { shallowMount } from "@vue/test-utils"
import SubmitProposalTxDetails from "src/components/transactions/message-view/SubmitProposalTxDetails"

describe(`SubmitProposalTxDetails`, () => {
  let wrapper

  const tx = {
    type: "SubmitProposalTx",
    hash: "47E70B788A3DEA7D7244A4EC0FC58B4FEAA36456541F94AD30BF37D0C6D96C1D",
    height: 779937,
    timestamp: "2020-02-10T10:13:15Z",
    memo: "",
    success: true,
    fees: [],
    details: {
      proposalType: "cosmos-sdk/TextProposal",
      proposalTitle: "Lunie was here!",
      proposalDescription: "Blah blah blah and blah blah blah ...",
      initialDeposit: {
        denom: "ATOM",
        amount: "10",
      },
    },
  }

  it(`renders a submit proposal transaction message`, () => {
    wrapper = shallowMount(SubmitProposalTxDetails, {
      propsData: {
        transaction: tx,
        validators: {},
      },
      stubs: [`router-link`],
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
