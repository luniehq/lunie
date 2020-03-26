import { shallowMount } from "@vue/test-utils"
import ClaimRewardsTxDetails from "src/components/transactions/message-view/ClaimRewardsTxDetails"

describe(`ClaimRewardsTxDetails`, () => {
  let wrapper

  const tx = {
    type: "ClaimRewardsTx",
    hash: "6D33991B1150161AF8D839B165E8EE84377213142D1FC1091FF4BAA783114678",
    height: 933171,
    timestamp: "2020-02-20T10:43:36Z",
    memo: "",
    success: true,
    fees: [],
    details: {
      from: ["cosmosvaloper123"],
      amounts: [
        {
          denom: "ATOM",
          amount: "10"
        }
      ]
    }
  }

  const multiTx = {
    type: "ClaimRewardsTx",
    hash: "6D33991B1150161AF8D839B165E8EE84377213142D1FC1091FF4BAA783114678",
    height: 933171,
    timestamp: "2020-02-20T10:43:36Z",
    memo: "",
    success: true,
    fees: [],
    details: {
      from: ["cosmosvaloper123", "cosmosvaloper456", "cosmosvaloper789"],
      amounts: [
        {
          denom: "ATOM",
          amount: "3"
        }
      ]
    }
  }

  const validators = {
    cosmosvaloper123: {
      name: `SuperValidator`,
      operatorAddress: `cosmosvaloper123`,
      picture: "",
      __typename: `Validator`
    },
    cosmosvaloper456: {
      name: `AwesomeValidator`,
      operatorAddress: `cosmosvaloper456`,
      picture: "",
      __typename: `Validator`
    },
    cosmosvaloper789: {
      name: `GiveMeYourMoney`,
      operatorAddress: `cosmosvaloper789`,
      picture: "",
      __typename: `Validator`
    }
  }

  it(`renders a claim rewards transaction message`, () => {
    wrapper = shallowMount(ClaimRewardsTxDetails, {
      propsData: {
        transaction: tx,
        validators: validators,
        show: false
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`renders a multi claim rewards transaction message`, () => {
    wrapper = shallowMount(ClaimRewardsTxDetails, {
      propsData: {
        transaction: multiTx,
        validators: validators,
        show: false
      },
      stubs: [`router-link`]
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`returns an empty array if validators haven't been loaded yet`, () => {
    const self = {
      validators: {}
    }
    const getValidatorsResponse = ClaimRewardsTxDetails.computed.getValidators.call(
      self
    )
    expect(getValidatorsResponse).toEqual([])
  })

  it(`returns false if the claim was from one validator and just one denom`, () => {
    const self = {
      getValidators: [{ name: "Pepito" }],
      transaction: {
        details: {
          amounts: [
            {
              amount: 1
            }
          ]
        }
      }
    }
    const multiClaimShow = ClaimRewardsTxDetails.computed.multiClaimShow.call(
      self
    )
    expect(multiClaimShow).toBe(false)
  })

  it(`returns the show prop if the claim was not from one validator and just one denom`, () => {
    const self = {
      show: true,
      getValidators: [{ name: "Pepito" }, { name: "Maria Magdalena" }],
      transaction: {
        details: {
          amounts: [
            {
              amount: 1
            }
          ]
        }
      }
    }
    const multiClaimShow = ClaimRewardsTxDetails.computed.multiClaimShow.call(
      self
    )
    expect(multiClaimShow).toBe(true)
  })
})
