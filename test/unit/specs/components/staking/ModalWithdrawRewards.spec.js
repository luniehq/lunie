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
    expect(wrapper.find(`.withdraw-limit`).exists()).toBe(true)
  })

  describe(`Withdraw`, () => {
    it(`should simulate transaction to estimate gas used`, async () => {
      const estimate = 1234567
      const $store = { dispatch: jest.fn(() => estimate) }
      const res = await ModalWithdrawRewards.methods.simulateForm.call({
        $store
      })

      expect($store.dispatch).toHaveBeenCalledWith(`simulateWithdralRewards`)
      expect(res).toBe(estimate)
    })

    it(`submits withdrawal`, async () => {
      const gas = `1234567`
      const gasPrice = 2.5e-8

      await ModalWithdrawRewards.methods.submitForm.call(
        { $store, ...propsData },
        gas,
        gasPrice,
        ``,
        `ledger`
      )

      expect($store.dispatch).toBeCalledWith(`withdrawRewards`, {
        gasPrice,
        gas,
        denom: wrapper.vm.denom,
        submitType: `ledger`,
        password: ``
      })

      expect($store.commit).toBeCalledWith(`notify`, {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      })
    })
  })
})
