import { shallowMount } from "@vue/test-utils"
import DepositMessageDetails from "src/components/transactions/message-view/DepositMessageDetails"

describe(`DepositMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=deposit
  const tx = {
    height: 2000000,
    value: {
      proposal_id: 1,
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
    group: `governance`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgDeposit`
  }

  it(`renders a deposit transaction message`, () => {
    wrapper = shallowMount(DepositMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
