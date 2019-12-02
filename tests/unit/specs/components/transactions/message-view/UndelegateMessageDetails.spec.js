import { shallowMount } from "@vue/test-utils"
import UndelegateMessageDetails from "src/components/transactions/message-view/UndelegateMessageDetails"

describe(`UndelegateMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=begin_unbonding
  const tx = {
    height: 2000000,
    value: {
      delegator_address: "cosmos16wgw3k7rspegl9khx79fuaa37unf4nfmxf7pyr",
      validator_address: "cosmosvaloper1sjllsnramtg3ewxqwwrwjxfgc4n4ef9u2lcnj0",
      amount: {
        denom: "uatom",
        amount: "100000"
      }
    },
    fee: {
      amount: "37",
      denom: "uatom"
    },
    hash: `ABCD1234`,
    group: `staking`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgUndelegate`
  }

  it(`renders a undelegate transaction message`, () => {
    wrapper = shallowMount(UndelegateMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
