import { shallowMount } from "@vue/test-utils"
import VoteMessageDetails from "src/components/transactions/message-view/VoteMessageDetails"

describe(`VoteMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=vote
  const tx = {
    height: 2000000,
    value: {
      proposal_id: "5",
      voter: "cosmos1lktjhnzkpkz3ehrg8psvmwhafg56kfss5597tg",
      option: "Abstain"
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
    type: `cosmos-sdk/MsgVote`
  }

  it(`renders a vote transaction message`, () => {
    wrapper = shallowMount(VoteMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
