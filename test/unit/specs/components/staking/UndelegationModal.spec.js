"use strict"

import { shallowMount, createLocalVue } from "@vue/test-utils"
import UndelegationModal from "staking/UndelegationModal"
import Vuelidate from "vuelidate"

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
        liquidAtoms: 1000042
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
    UndelegationModal.methods.open.call($refs)
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const $v = { $reset: jest.fn() }
    const selectedIndex = 1
    const amount = 10
    UndelegationModal.methods.clear.call($v, selectedIndex, amount)
    expect($v.$reset).toHaveBeenCalled()
    expect(selectedIndex).toBe(0)
    expect(amount).toBe(null)
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

  describe(`submitForm`, () => {
    it(`submits undelegation`, async () => {
      const $store = {
        dispatch: jest.fn(),
        commit: jest.fn()
      }
      const validator = {
        operator_address: `cosmosvaloper1address`,
      }

      wrapper.setData({ amount: 4.2 })
      await UndelegationModal.methods.submitForm.call(
        { $store, amount: 4.2, denom: `atom`, validator },
        `local`, `1234567890`
      )

      expect($store.dispatch).toHaveBeenCalledWith(`submitUnbondingDelegation`,
        {
          amount: -4200000,
          validator,
          submitType: `local`,
          password: `1234567890`
        }
      )

      expect($store.commit).toHaveBeenCalledWith(`notify`,
        {
          body: `You have successfully undelegated 4.2 atoms.`,
          title: `Successful undelegation!`
        }
      )
    })
  })
})
