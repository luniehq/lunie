import { shallowMount } from "@vue/test-utils"
import WithdrawDelegationRewardMessageDetails from "src/components/transactions/message-view/WithdrawDelegationRewardMessageDetails"

describe(`WithdrawalDelegationRewardMessageDetails`, () => {
  let wrapper
  // Examples @ https://stargate.cosmos.network/txs?action=withdraw_validator_rewards_all
  const tx = {
    height: 2000000,
    value: {
      delegator_address: "cosmos15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2kc6z4s",
      validator_address: "cosmosvaloper15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2nvwher"
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
    type: `cosmos-sdk/MsgWithdrawDelegationReward`
  }

  const validators = {
    cosmosvaloper15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2nvwher: {
      name: `SuperValidator`,
      operatorAddress: `cosmosvaloper15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2nvwher`,
      picture: '',
      __typename: `Validator`
    },
    cosmos1: {
      name: `SuperValidator`,
      operatorAddress: `"cosmos1"`,
      picture: '',
      __typename: `Validator`
    }
  }

  it(`renders a withdraw delegation reward transaction message`, () => {
    wrapper = shallowMount(WithdrawDelegationRewardMessageDetails, {
      propsData: {
        transaction: tx,
        validators: validators
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a withdraw delegation reward transaction message without validator`, () => {
    wrapper = shallowMount(WithdrawDelegationRewardMessageDetails, {
      propsData: {
        transaction: tx,
        validators: validators
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
