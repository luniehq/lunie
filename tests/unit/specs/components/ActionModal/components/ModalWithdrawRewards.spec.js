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
      denom: "stake"
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
