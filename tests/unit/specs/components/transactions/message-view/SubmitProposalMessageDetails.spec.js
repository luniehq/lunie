import { shallowMount } from "@vue/test-utils"
import SubmitProposalMessageDetails from "src/components/transactions/message-view/SubmitProposalMessageDetails"

describe(`SubmitProposalMessageDetails`, () => {
  let wrapper

  // Examples @ https://stargate.cosmos.network/txs?action=submit_proposal
  const tx = {
    height: 2000000,
    value: {
      title: "Bla bla bla",
      description: "Bla bla bla",
      proposal_type: "Text",
      proposer: "cosmos1ey69r37gfxvxg62sh4r0ktpuc46pzjrmz29g45",
      initial_deposit: [
        {
          denom: "uatom",
          amount: "100000000"
        }
      ]
    },
    fee: {
      amount: "37",
      denom: "uatom"
    },
    hash: `ABCD1234`,
    group: `governance`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgSubmitProposal`
  }

  it(`renders a submit proposal transaction message`, () => {
    wrapper = shallowMount(SubmitProposalMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
