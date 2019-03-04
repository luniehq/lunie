"use strict"

import { shallowMount } from "@vue/test-utils"
import ModalWithdrawAllRewards from "staking/ModalWithdrawAllRewards"

describe(`ModalWithdrawAllRewards`, () => {
  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        bondDenom: `stake`,
        distribution: { totalRewards: { stake: 10000000 } }
      }
    }
    wrapper = shallowMount(ModalWithdrawAllRewards, {
      mocks: {
        $store
      },
    })
  })

  it(`shows withdaw rewards modal`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`form is always valid`, () => {
    const valid = ModalWithdrawAllRewards.methods.isValid.call()
    expect(valid).toBe(true)
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalWithdrawAllRewards.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  describe(`Withdraw`, () => {
    it(`submits withdrawal`, async () => {
      const $store = {
        dispatch: jest.fn(),
        commit: jest.fn()
      }
      await ModalWithdrawAllRewards.methods.submitForm.call(
        { $store },
        `local`, `1234567890`
      )

      expect($store.dispatch).toBeCalledWith(`withdrawAllRewards`,
        {
          submitType: `local`,
          password: `1234567890`
        }
      )

      expect($store.commit).toBeCalledWith(`notify`,
        {
          title: `Successful withdrawal!`,
          body: `You have successfully withdrawn all your unclaimed rewards.`
        }
      )
    })
  })
})
