"use strict"

import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ModalDeposit from "src/ActionModal/components/ModalDeposit"
import mockValues from "tests/unit/helpers/mockValues.js"

describe(`ModalDeposit`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => {})

  const balance = { denom: `STAKE`, amount: `20` }

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        userAddress: "cosmo1",
        currentNetwork: {
          id: "testnet",
          network_type: "cosmos",
          coinLookup: [
            { viewDenom: "STAKE", chainToViewConversionFactor: 0.000001 },
          ],
        },
      },
    }

    wrapper = shallowMount(ModalDeposit, {
      localVue,
      mocks: {
        $store,
      },
      propsData: {
        proposalId: `1`,
        proposalTitle: mockValues.state.proposals[`1`].title,
        denom: `STAKE`,
      },
      sync: false,
    })
    wrapper.setData({ balance })
  })

  it(`should display deposit modal form`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it.skip(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalDeposit.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      amount: 10,
    }

    ModalDeposit.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.amount).toBe(0)
  })

  it(`sends an event on success`, () => {
    const self = {
      $emit: jest.fn(),
    }
    ModalDeposit.methods.onSuccess.call(self)
    expect(self.$emit).toHaveBeenCalledWith(
      "success",
      expect.objectContaining({})
    )
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`when the amount deposited higher than the user's balance`, async () => {
        wrapper.setData({ balance: { denom: `STAKE`, amount: `20` } })
        wrapper.setData({ amount: 250 })
        expect(wrapper.vm.validateForm()).toBe(false)
        await wrapper.vm.$nextTick()

        expect(wrapper.html()).toContain(`error="true"`)
      })

      it(`when the user doesn't have the deposited coin`, () => {
        wrapper.setData({ amount: 25 })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`succeeds`, () => {
      it(`when the user has enough balance to submit a deposit`, async () => {
        wrapper.setData({ balance: { denom: `STAKE`, amount: `20` } })
        wrapper.setData({ amount: 10 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  it("should return transaction data in correct form", () => {
    wrapper.setData({
      amount: 2,
    })
    expect(wrapper.vm.transactionData).toEqual({
      type: "DepositTx",
      proposalId: "1",
      amount: {
        amount: 2,
        denom: "STAKE",
      },
      depositsCount: 0,
    })
  })

  it("should return empty transaction data if amount is NaN", () => {
    wrapper.setData({
      amount: `NaN`,
    })
    expect(wrapper.vm.transactionData).toEqual({})
  })

  it("should return notification message", () => {
    wrapper.setData({
      amount: 2,
    })
    expect(wrapper.vm.notifyMessage).toEqual({
      title: `Successful deposit!`,
      body: `You have successfully deposited your STAKEs on proposal #1`,
    })
  })
})
