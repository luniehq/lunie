"use strict"

import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalDeposit`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        session: { signedIn: true },
        connection: { connected: true },
        bondDenom: `uatom`,
        liquidAtoms: 1000000
      }
    }

    wrapper = shallowMount(ModalDeposit, {
      localVue,
      mocks: {
        $store
      },
      propsData: {
        proposalId: `1`,
        proposalTitle: lcdClientMock.state.proposals[`1`].title,
        denom: `stake`
      },
      sync: false
    })
  })

  it(`should display deposit modal form`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalDeposit.methods.open.call($refs)
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const $v = { $reset: jest.fn() }
    const amount = 10
    ModalDeposit.methods.clear.call($v, amount)
    expect($v.$reset).toHaveBeenCalled()
    expect(amount).toBe(0)
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`when the amount deposited higher than the user's balance`, async () => {
        wrapper.setData({ amount: 250 })
        expect(wrapper.vm.validateForm()).toBe(false)
        await wrapper.vm.$nextTick()
        const errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`when the user doesn't have the deposited coin`, () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        $store.commit(`setWalletBalances`, otherCoins)
        wrapper.setData({ amount: 25 })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`succeeds`, () => {
      it(`when the user has enough balance to submit a deposit`, async () => {
        wrapper.setData({ amount: 15 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  describe(`Deposit`, () => {
    it(`submits a deposit`, async () => {

      const $store = {
        dispatch: jest.fn(),
        commit: jest.fn()
      }

      await ModalDeposit.methods.submitForm.call(
        { type: `Text`, denom: `uatom`, proposalId: `1`, amount: 10, $store },
        `ledger`, ``
      )

      expect($store.dispatch).toHaveBeenCalledWith(`submitDeposit`,
        {
          amount: [
            {
              amount: `10000000`,
              denom: `stake`
            }
          ],
          proposal_id: `1`,
          password: `1234567890`,
          submitType: `local`
        }
      )

      expect($store.commit).toHaveBeenCalledWith(`notify`,
        {
          body: `You have successfully deposited your stakes on proposal #1`,
          title: `Successful deposit!`
        }
      )
    })
  })
})
