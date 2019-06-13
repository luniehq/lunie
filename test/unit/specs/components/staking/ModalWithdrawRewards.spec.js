"use strict"

import { shallowMount } from "@vue/test-utils"
import ModalWithdrawRewards from "staking/ModalWithdrawRewards"

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
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens the action modal`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalWithdrawRewards.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`should display message when withdrawing from multiple validators`, () => {
    wrapper.setProps({
      validatorAddress: null
    })
    expect(wrapper.find(`.withdraw-limit`).exists()).toBe(true)
  })

  it(`should not display message when withdrawing from single validators`, () => {
    expect(wrapper.find(`.withdraw-limit`).exists()).toBe(false)
  })
})
