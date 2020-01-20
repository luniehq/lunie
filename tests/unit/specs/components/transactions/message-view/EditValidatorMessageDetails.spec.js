import { shallowMount } from "@vue/test-utils"
import EditValidatorMessageDetails from "src/components/transactions/message-view/EditValidatorMessageDetails"

describe(`EditValidatorMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=edit_validator
  const tx = {
    height: 2000000,
    value: {
      address: `cosmos1`
    },
    fee: {
      amount: [
        {
          amount: "37",
          denom: "uatom"
        }
      ]
    },
    hash: `ABCD1234`,
    group: `staking`,
    key: "keyhash",
    memo: "(Sent via Lunie)",
    timestamp: 123456789,
    liquidDate: null,
    type: `cosmos-sdk/MsgEditValidator`
  }

  it(`renders a edit validator transaction message`, () => {
    wrapper = shallowMount(EditValidatorMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
