import { shallowMount } from "@vue/test-utils"
import DelegateMessageDetails from "src/components/transactions/message-view/DelegateMessageDetails"

describe(`DelegateMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=delegate
  const tx = {
    height: 2000000,
    value: {
      validator_address: `cosmos1`,
      amount: [
        {
          amount: "10000000000",
          denom: "uatom"
        }
      ]
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
    type: `cosmos-sdk/MsgDelegate`
  }

  it(`renders a redelegate transaction message`, () => {
    wrapper = shallowMount(DelegateMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
