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
        distribution: { totalRewards: { stake: 10000000 } },
        lastHeader: { height: `10` },
        session: { signedIn: true }
      }
    }
    wrapper = shallowMount(ModalWithdrawAllRewards, {
      mocks: {
        $store
      },
    })
  })

  it(`should show the withdraw rewards modal`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens the action modal`, () => {
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

  describe(`update total rewards on new blocks`, () => {
    describe(`shouldn't update total `, () => {
      it(`if user is not signed in `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: false }
        const $refs = { actionModal: { show: true } }
        ModalWithdrawAllRewards.watch.lastHeader.handler.call(
          { session, $store, $refs })
        expect($store.dispatch).not.toHaveBeenCalledWith(`getTotalRewards`)
      })

      it(`if user is not on watching the modal `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        let $refs = {}
        ModalWithdrawAllRewards.watch.lastHeader.handler.call(
          { session, $store, $refs })
        expect($store.dispatch).not.toHaveBeenCalledWith(`getTotalRewards`)

        $refs = { actionModal: { show: false } }
        ModalWithdrawAllRewards.watch.lastHeader.handler.call(
          { session, $store, $refs })
        expect($store.dispatch).not.toHaveBeenCalledWith(`getTotalRewards`)
      })
    })

    describe(`should update total rewards `, () => {
      it(`if user is signed in and is watching the modal `, () => {
        const $store = { dispatch: jest.fn() }
        const session = { signedIn: true }
        const $refs = { actionModal: { show: true } }
        ModalWithdrawAllRewards.watch.lastHeader.handler.call(
          { session, $store, $refs })
        expect($store.dispatch).toHaveBeenCalledWith(`getTotalRewards`)
      })
    })
  })
})
