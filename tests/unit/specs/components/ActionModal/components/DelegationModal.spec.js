"use strict"

import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import Vuelidate from "vuelidate"
import mockValues from "tests/unit/helpers/mockValues.js"

const context = {
  url: "http://lunie.io",
  chainId: "cosmoshub",
  connected: true,
  userAddress: mockValues.addresses[0],
  committedDelegations: [],
  delegates: [],
  localKeyPairName: "localKeyPairName"
}

describe(`DelegationModal`, () => {
  let wrapper
  const { stakingParameters } = mockValues.state
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => {})

  const state = {
    session: {
      signedIn: true,
      address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`
    }
  }

  const getters = {
    connection: { connected: true },
    stakingParameters: { parameters: stakingParameters },
    modalContext: {
      ...context,
      delegates: mockValues.state.candidates
    }
  }

  beforeEach(() => {
    wrapper = shallowMount(DelegationModal, {
      localVue,
      mocks: {
        $store: { getters, state }
      },
      propsData: {
        validator: mockValues.state.candidates[0],
        fromOptions: [
          {
            address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
            key: `My Wallet - cosmos…3p4mqpjyrm5ctpesxxn9`,
            maximum: 1000000000,
            value: 0
          },
          {
            address: mockValues.state.candidates[1].operator_address,
            key: `Billy the Bill - cosmos…psjr9565ef72pv9g20yx`,
            maximum: 23.0484375481,
            value: 1
          },
          {
            address: `cosmos18thamkhnj9wz8pa4nhnp9rldprgant57ryzag7`,
            key: `Kentucky - cosmos…np9rldprgant57ryzag7`,
            maximum: 1.3788878447,
            value: 2
          }
        ],
        to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
        denom: stakingParameters.parameters.bond_denom
      }
    })
  })

  it(`should display the delegation modal form`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should submit when enterPressed is called`, async () => {
    const self = {
      $refs: { actionModal: { validateChangeStep: jest.fn() } }
    }
    DelegationModal.methods.enterPressed.call(self)
    expect(self.$refs.actionModal.validateChangeStep).toHaveBeenCalled()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    DelegationModal.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`opens and switches to redelegaion when selected`, () => {
    wrapper.vm.$refs = { actionModal: { open: jest.fn() } }
    wrapper.vm.open({ redelegation: true })
    expect(wrapper.vm.selectedIndex).toBe(1)
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      selectedIndex: 1,
      amount: 10
    }
    DelegationModal.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.selectedIndex).toBe(0)
    expect(self.amount).toBeNull()
  })

  describe(`if amount field max button clicked`, () => {
    it(`amount has to be 1000 atom`, async () => {
      wrapper.vm.setMaxAmount()
      expect(wrapper.vm.amount).toBe(1000)
    })
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if the user manually inputs a number greater than the balance`, () => {
        wrapper.setData({ amount: 1420 })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`succeeds`, () => {
      it(`if the amount is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  describe("Submission Data for Delegating", () => {
    beforeEach(() => {
      wrapper.setData({
        amount: 10,
        selectedIndex: 0,
        validator: mockValues.state.candidates[1]
      })
    })

    //mockValues.state.candidates[0].operator_address
    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "MsgDelegate",
        validatorAddress: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
        amount: "10000000",
        denom: "STAKE"
      })
    })

    it("should return correct notification message for delegating", () => {
      expect(wrapper.vm.notifyMessage).toEqual({
        title: `Successful delegation!`,
        body: `You have successfully delegated your STAKEs`
      })
    })
  })

  describe("Submission Data for Redelegating", () => {
    beforeEach(() => {
      wrapper.setData({
        amount: 10,
        selectedIndex: 1,
        validator: {
          operator_address: "cosmosDstAddress1"
        }
      })
    })

    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "MsgRedelegate",
        validatorSourceAddress:
          "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au",
        validatorDestinationAddress: "cosmosDstAddress1",
        amount: "10000000",
        denom: "STAKE"
      })
      // expect(wrapper.vm.transactionData).toEqual()
    })

    it("should return correct notification message for delegating", () => {
      expect(wrapper.vm.notifyMessage).toEqual({
        title: `Successful redelegation!`,
        body: `You have successfully redelegated your STAKEs`
      })
    })
  })

  describe(`if amount field max button clicked`, () => {
    it(`amount has to be 1000 atom`, async () => {
      wrapper.setData({
        amount: 1,
        selectedIndex: 0,
        validator: mockValues.state.candidates[1]
      })
      wrapper.vm.setMaxAmount()
      expect(wrapper.vm.amount).toBe(1000)
    })
    it(`should show warning message`, async () => {
      wrapper.setData({
        amount: 1000,
        selectedIndex: 0,
        validator: mockValues.state.candidates[1]
      })
      //await wrapper.vm.$nextTick()
      expect(wrapper.html()).toContain(
        "You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
      )
    })
  })

  describe(`if validator is jailed`, () => {
    it(`must show warn message about it`, async () => {
      wrapper.setData({
        amount: 1,
        selectedIndex: 0,
        validator: mockValues.state.candidates[3] // Jailed validator
      })
      expect(wrapper.html()).toContain(
        "You are about to delegate to an inactive validator (temporally banned from the network)"
      )
    })
  })

  describe(`if validator is tombstoned`, () => {
    it(`must show warn message about it`, async () => {
      wrapper.setData({
        amount: 1,
        selectedIndex: 0,
        validator: mockValues.state.candidates[4] // Tombstoned validator
      })
      expect(wrapper.html()).toContain(
        "You are about to delegate to an inactive validator (banned from the network)"
      )
    })
  })

  describe(`if validator is active`, () => {
    it(`must not show warn message`, async () => {
      wrapper.setData({
        amount: 1,
        selectedIndex: 0,
        validator: mockValues.state.candidates[2] // Active validator
      })
      expect(wrapper.html()).not.toContain(
        "You are about to delegate to an inactive validator"
      )
      expect(wrapper.vm.validatorStatusDetailed).toBe(false)
    })
  })
})
