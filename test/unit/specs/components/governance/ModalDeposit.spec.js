"use strict"

import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ModalDeposit from "src/components/governance/ModalDeposit"
import lcdClientMock from "src/connectors/lcdClientMock.js"

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
        liquidAtoms: 1000000,
        wallet: {
          balances: [{ denom: `uatom`, amount: `10` }],
          loading: false
        }
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
        denom: `uatom`
      },
      sync: false
    })
  })

  it(`should display deposit modal form`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalDeposit.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      amount: 10
    }

    ModalDeposit.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.amount).toBe(0)
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

        expect(wrapper.html()).toContain(`error="true"`)
      })

      it(`when the user doesn't have the deposited coin`, () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        wrapper.vm.wallet.balances = otherCoins
        wrapper.setData({ amount: 25 })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`succeeds`, () => {
      it(`when the user has enough balance to submit a deposit`, async () => {
        wrapper.vm.wallet.balances = [{ denom: `uatom`, amount: `20000000` }]
        wrapper.setData({ amount: 10 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  xdescribe(`Deposit`, () => {
    it(`should simulate transaction to estimate gas used`, async () => {
      const estimate = 1234567
      const $store = { dispatch: jest.fn(() => estimate) }
      const res = await ModalDeposit.methods.simulateForm.call({
        $store,
        type: `Text`,
        denom: `uatom`,
        amount: 10,
        proposalId: `1`
      })

      expect($store.dispatch).toHaveBeenCalledWith(`simulateDeposit`, {
        amount: [
          {
            amount: `10000000`,
            denom: `uatom`
          }
        ],
        proposal_id: `1`
      })
      expect(res).toBe(estimate)
    })
    it(`submits a deposit`, async () => {
      const $store = {
        dispatch: jest.fn(),
        commit: jest.fn()
      }

      const gas = `1234567`
      const gasPrice = 2.5e-8
      const gas_prices = [{ denom: `uatom`, amount: `0.025` }]

      await ModalDeposit.methods.submitForm.call(
        {
          denom: `uatom`,
          bondDenom: `uatom`,
          proposalId: `1`,
          amount: 10,
          $store
        },
        gas,
        gasPrice,
        ``,
        `ledger`
      )

      expect($store.dispatch).toHaveBeenCalledWith(`submitDeposit`, {
        amount: [
          {
            amount: `10000000`,
            denom: `uatom`
          }
        ],
        proposal_id: `1`,
        gas,
        gas_prices,
        password: ``,
        submitType: `ledger`
      })

      expect($store.commit).toHaveBeenCalledWith(`notify`, {
        body: `You have successfully deposited your ATOMs on proposal #1`,
        title: `Successful deposit!`
      })
    })
  })
})
