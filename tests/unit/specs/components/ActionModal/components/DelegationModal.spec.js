"use strict"

import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import Vuelidate from "vuelidate"

const validators = [
  {
    operatorAddress: "cosmosvaladdr12324536463",
    status: "ACTIVE"
  },
  {
    operatorAddress: "cosmosvaladdr1sdsdsd123123",
    status: "ACTIVE"
  },
  {
    operatorAddress: "cosmosvaladdr1kjisjsd862323",
    status: "INACTIVE",
    statusDetailed: "temporally banned from the network"
  },
  {
    operatorAddress: "cosmosvaladdr1sd0f8mnbjb2",
    status: "INACTIVE",
    statusDetailed: "banned from the network"
  }
]

describe(`DelegationModal`, () => {
  let wrapper
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => { })

  const state = {
    session: {
      signedIn: true
    }
  }

  const getters = {
    network: "testnet",
    address: "cosmos1234"
  }

  beforeEach(() => {
    wrapper = shallowMount(DelegationModal, {
      localVue,
      mocks: {
        $store: { getters, state },
        $apollo: {
          queries: {
            balance: { refetch: () => { } },
            delegations: { refetch: () => { } }
          }
        }
      },
      propsData: {
        targetValidator: validators[0]
      }
    })
    wrapper.setData({
      delegations: [
        {
          validator: validators[0],
          amount: 10
        },
        {
          validator: validators[1],
          amount: 124
        }
      ],
      denom: "STAKE",
      balance: {
        amount: 1000,
        denom: "STAKE"
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
    expect(self.amount).toBe(0)
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
      wrapper.setProps({
        targetValidator: validators[1]
      })
      wrapper.setData({
        amount: 10,
        selectedIndex: 0
      })
    })

    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "MsgDelegate",
        validatorAddress: `cosmosvaladdr1sdsdsd123123`,
        amount: "10000000",
        denom: "stake"
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
      wrapper.setProps({
        targetValidator: validators[1]
      })
      wrapper.setData({
        amount: 10,
        selectedIndex: 1
      })
    })

    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "MsgRedelegate",
        validatorSourceAddress: "cosmosvaladdr12324536463",
        validatorDestinationAddress: "cosmosvaladdr1sdsdsd123123",
        amount: "10000000",
        denom: "stake"
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
        selectedIndex: 0
      })
      wrapper.vm.setMaxAmount()
      expect(wrapper.vm.amount).toBe(1000)
    })
    it(`should show warning message`, async () => {
      wrapper.setData({
        amount: 1000,
        selectedIndex: 0
      })
      //await wrapper.vm.$nextTick()
      expect(wrapper.html()).toContain(
        "You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
      )
    })
  })

  describe(`if validator is jailed`, () => {
    it(`must show warn message about it`, async () => {
      wrapper.setProps({
        targetValidator: validators[2] // Jailed validator
      })
      wrapper.setData({
        amount: 1,
        selectedIndex: 0
      })
      expect(wrapper.html()).toContain(
        "You are about to delegate to an inactive validator (temporally banned from the network)"
      )
    })
  })

  describe(`if validator is tombstoned`, () => {
    it(`must show warn message about it`, async () => {
      wrapper.setProps({
        targetValidator: validators[3] // Tombstoned validator
      })
      wrapper.setData({
        amount: 1,
        selectedIndex: 0
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
        targetValidator: validators[0] // Active validator
      })
      expect(wrapper.html()).not.toContain(
        "You are about to delegate to an inactive validator"
      )
      expect(wrapper.find("#to .tm-form-msg--desc").exists()).toBe(false)
    })
  })
})
