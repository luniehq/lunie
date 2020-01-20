import { shallowMount } from "@vue/test-utils"
import CreateValidatorMessageDetails from "src/components/transactions/message-view/CreateValidatorMessageDetails"

describe(`CreateValidatorMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=create_validator
  const tx = {
    height: 2000000,
    value: {
      validator_address: `cosmos1`
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
    type: `cosmos-sdk/MsgCreateValidator`
  }

  it(`renders a create validator transaction message`, () => {
    wrapper = shallowMount(CreateValidatorMessageDetails, {
      propsData: {
        transaction: tx,
        validators: {}
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
