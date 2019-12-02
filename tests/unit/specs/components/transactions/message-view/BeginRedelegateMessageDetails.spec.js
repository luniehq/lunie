import { shallowMount } from "@vue/test-utils"
import BeginRedelegateMessageDetails from "src/components/transactions/message-view/BeginRedelegateMessageDetails"

describe(`BeginRedelegateMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=begin_redelegate
  const tx = {
    height: 2000000,
    value: {
      validator_src_address: `cosmos1`,
      validator_dst_address: `cosmos2`,
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
    type: `cosmos-sdk/MsgBeginRedelegate`
  }

  it(`renders a redelegate transaction message`, () => {
    wrapper = shallowMount(BeginRedelegateMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
