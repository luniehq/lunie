"use strict"

import { shallowMount } from "@vue/test-utils"
import ModalWithdrawRewards from "src/ActionModal/components/ModalWithdrawRewards"

describe(`ModalWithdrawRewards`, () => {
  let wrapper, $store, propsData
  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }
    propsData = {
      validatorAddress: "cosmos1234567",
      rewards: 0,
      denom: "STAKE"
    }

    wrapper = shallowMount(ModalWithdrawRewards, {
      mocks: {
        $store
      },
      propsData
    })
  })

  it(`should show the withdraw rewards modal`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens the action modal`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalWithdrawRewards.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`filters the staking denom rewards to display as totalRewards`, () => {
    const self = {
      rewards: [
        {
          denom: `STAKE`,
          amount: 1
        },
        {
          denom: `NOTSTAKE`,
          amount: 2
        }
      ],
      denom: "STAKE"
    }
    const totalRewards = ModalWithdrawRewards.computed.totalRewards.call(self)
    expect(totalRewards).toEqual(`1.000000`)
  })

  it(`should display message when withdrawing from multiple validators`, () => {
    expect(wrapper.find(`.withdraw-limit`).exists()).toBe(true)
  })

  describe("Submission Data for Delegating", () => {
    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "MsgWithdrawDelegationReward"
      })
    })

    it("should return correct notification message for delegating", () => {
      expect(wrapper.vm.notifyMessage).toEqual({
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      })
    })
  })
})
