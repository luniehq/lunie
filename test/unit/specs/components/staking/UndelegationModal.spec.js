"use strict"

import { shallowMount, createLocalVue } from "@vue/test-utils"
import UndelegationModal from "staking/UndelegationModal"
import Vuelidate from "vuelidate"

const context = {
  url: "http://lunie.io",
  chainId: "cosmoshub",
  connected: true,
  userAddress: "cosmos1abcdefghijklmop",
  committedDelegations: [],
  delegates: [],
  localKeyPairName: "localKeyPairName"
}

describe(`UndelegationModal`, () => {
  let wrapper, $store
  const stakingParameters = {
    unbonding_time: `259200000000000`,
    max_validators: 100,
    bond_denom: `STAKE`
  }
  const validator = {
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
    // we don't need other props in this component
  }
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        bondDenom: `stake`,
        liquidAtoms: 1000042,
        modalContext: context
      }
    }
    wrapper = shallowMount(UndelegationModal, {
      localVue,
      mocks: {
        $store
      },
      propsData: {
        maximum: 1000000000,
        validator,
        to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
        denom: stakingParameters.bond_denom,
        fromOptions: [
          {
            address: `cosmosval1234`
          }
        ]
      }
    })
  })

  it(`should display undelegation modal form`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    UndelegationModal.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      amount: 10
    }
    UndelegationModal.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.amount).toBeNull()
  })

  describe(`only submits on correct form`, () => {
    describe(`validates`, () => {
      it(`to false with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`to true if the amount is positive and the user has enough liquid atoms`, () => {
        wrapper.setData({ amount: 50 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  xdescribe(`simulateForm`, () => {
    it(`should simulate transaction to estimate gas used`, async () => {
      const estimate = 1234567
      const validator = { operator_address: `cosmosvaloper1address` }
      const self = {
        $store: { dispatch: jest.fn(() => estimate) },
        amount: 4.2,
        validator
      }
      const res = await UndelegationModal.methods.simulateForm.call(self)

      expect(self.$store.dispatch).toHaveBeenCalledWith(
        `simulateUnbondingDelegation`,
        {
          amount: `4200000`,
          validator
        }
      )
      expect(res).toBe(estimate)
    })
  })

  xdescribe(`submitForm`, () => {
    it(`submits undelegation`, async () => {
      const $store = {
        dispatch: jest.fn(),
        commit: jest.fn()
      }
      const validator = { operator_address: `cosmosvaloper1address` }
      const gas = `1234567`
      const gasPrice = 2.5e-8
      const gas_prices = [{ denom: `uatom`, amount: `0.025` }]

      wrapper.setData({ amount: 4.2 })
      await UndelegationModal.methods.submitForm.call(
        { $store, amount: 4.2, denom: `uatom`, validator },
        gas,
        gasPrice,
        `1234567890`,
        `local`
      )

      expect($store.dispatch).toHaveBeenCalledWith(
        `submitUnbondingDelegation`,
        {
          amount: `4200000`,
          validator,
          gas,
          gas_prices,
          submitType: `local`,
          password: `1234567890`
        }
      )

      expect($store.commit).toHaveBeenCalledWith(`notify`, {
        body: `You have successfully undelegated 4.2 ATOMs.`,
        title: `Successful undelegation!`
      })
    })
  })
})
