import { shallowMount } from "@vue/test-utils"
import UnjailMessageDetails from "src/components/transactions/message-view/UnjailMessageDetails"

describe(`UnjailMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=unjail
  const tx = {
    height: 2000000,
    value: {
      address: "cosmos16wgw3k7rspegl9khx79fuaa37unf4nfmxf7pyr"
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
    type: `cosmos-sdk/MsgUnjail`
  }

  it(`renders a unjail validator transaction message`, () => {
    wrapper = shallowMount(UnjailMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
