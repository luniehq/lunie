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
})
