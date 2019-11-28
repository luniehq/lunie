import { shallowMount } from "@vue/test-utils"
import SendMessageDetails from "src/components/transactions/message-view/SendMessageDetails"

describe(`SendMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=send
  const tx = {
    height: 2000000,
    value: {
      from_address: `cosmos1`,
      to_address: `cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee`,
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
    group: `banking`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgSend`
  }

  it(`renders a sent transaction message`, () => {
    wrapper = shallowMount(SendMessageDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmos1"
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a received transaction message`, () => {
    wrapper = shallowMount(SendMessageDetails, {
      propsData: {
        transaction: tx,
        sessionAddress: "cosmos1ahtlr29s38w23xxq7slcwmmz4c8x9efmr8qmee"
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

})
