import { shallowMount } from "@vue/test-utils"
import SetWithdrawAddressMessageDetails from "src/components/transactions/message-view/SetWithdrawAddressMessageDetails"

describe(`SetWithdrawAddressMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=set_withdraw_address
  const tx = {
    height: 2000000,
    value: {
      withdraw_address: `cosmos1`
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
    type: `cosmos-sdk/MsgModifyWithdrawAddress`
  }

  it(`renders a set withdraw address transaction message`, () => {
    wrapper = shallowMount(SetWithdrawAddressMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
