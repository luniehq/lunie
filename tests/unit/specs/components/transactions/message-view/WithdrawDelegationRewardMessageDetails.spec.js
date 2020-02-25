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
      picture: "",
      __typename: `Validator`
    },
    cosmos1: {
      name: `SuperValidator`,
      operatorAddress: `"cosmos1"`,
      picture: "",
      __typename: `Validator`
    },
    cosmosvaloper12w6tynmjzq4l8zdla3v4x0jt8lt4rcz5gk7zg2: {
      name: `GiveMeYourMoney`,
      operatorAddress: `cosmosvaloper12w6tynmjzq4l8zdla3v4x0jt8lt4rcz5gk7zg2`,
      picture: "",
      __typename: `Validator`
    }
  }

  it(`renders a withdraw delegation reward transaction message`, () => {
    wrapper = shallowMount(WithdrawDelegationRewardMessageDetails, {
      propsData: {
        transaction: tx,
        validators: validators,
        show: false
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a withdraw delegation reward transaction message without validator`, () => {
    wrapper = shallowMount(WithdrawDelegationRewardMessageDetails, {
      propsData: {
        transaction: tx,
        validators: validators,
        show: false
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`if the transaction value is an array with more than one element, it returns an array of validators
  of more than one element too`, () => {
    const multiTx = {
      ...tx,
      withdrawValidators: JSON.stringify([
        {
          value: {
            delegator_address: "cosmos15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2kc6z4s",
            validator_address:
              "cosmosvaloper15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2nvwher"
          }
        },
        {
          value: {
            delegator_address: "cosmos15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2kc6z4s",
            validator_address:
              "cosmosvaloper12w6tynmjzq4l8zdla3v4x0jt8lt4rcz5gk7zg2"
          }
        }
      ])
    }
    wrapper = shallowMount(WithdrawDelegationRewardMessageDetails, {
      propsData: {
        transaction: multiTx,
        validators: validators,
        show: false
      },
      stubs: [`router-link`]
    })
    expect(wrapper.vm.getValidators).toEqual([
      {
        name: "SuperValidator",
        operatorAddress: "cosmosvaloper15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2nvwher",
        picture: "",
        __typename: "Validator"
      },
      {
        name: "GiveMeYourMoney",
        operatorAddress: "cosmosvaloper12w6tynmjzq4l8zdla3v4x0jt8lt4rcz5gk7zg2",
        picture: "",
        __typename: "Validator"
      }
    ])
  })

  it(`if the transaction value is an array with just one element, it returns an array with just
  one validator`, () => {
    wrapper = shallowMount(WithdrawDelegationRewardMessageDetails, {
      propsData: {
        transaction: tx,
        validators: validators,
        show: false
      },
      stubs: [`router-link`]
    })
    expect(wrapper.vm.getValidators).toEqual([
      {
        __typename: "Validator",
        name: "SuperValidator",
        operatorAddress: "cosmosvaloper15r4tc0m6hc7z8drq3dzlrtcs6rq2q9l2nvwher",
        picture: ""
      }
    ])
  })
})
