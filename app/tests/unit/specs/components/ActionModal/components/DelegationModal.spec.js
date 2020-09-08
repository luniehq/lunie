"use strict"

import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import Vuelidate from "vuelidate"

const validators = [
  {
    operatorAddress: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
    status: "ACTIVE",
  },
  {
    operatorAddress: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au",
    status: "ACTIVE",
  },
  {
    operatorAddress: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n",
    status: "INACTIVE",
    statusDetailed: "temporally banned from the network",
  },
  {
    operatorAddress: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7m",
    status: "INACTIVE",
    statusDetailed: "banned from the network",
  },
]

describe(`DelegationModal`, () => {
  let wrapper
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => {})

  const state = {
    session: {
      signedIn: true,
      addressRole: undefined,
    },
  }

  const getters = {
    network: "testnet",
    currentNetwork: {
      id: "testnet",
      coinLookup: [
        { viewDenom: "STAKE", chainToViewConversionFactor: 0.000001 },
      ],
      lockUpPeriod: `21 days`,
      stakingDenom: "STAKE",
    },
    address: "cosmos1234",
  }

  beforeEach(() => {
    wrapper = shallowMount(DelegationModal, {
      localVue,
      mocks: {
        $store: { getters, state },
        $apollo: {
          queries: {
            balance: { refetch: () => {} },
            delegations: { refetch: () => {} },
            validators: { refetch: () => {} },
          },
        },
      },
      propsData: {
        targetValidator: validators[0],
      },
    })
    wrapper.setData({
      delegations: [
        {
          validator: validators[0],
          amount: 10,
        },
        {
          validator: validators[1],
          amount: 124,
        },
        {
          validator: validators[2],
          amount: 200,
        },
      ],
      balance: {
        total: 2000,
        available: 1000,
        denom: "STAKE",
      },
      validators: validators,
    })
  })

  it(`should display the delegation modal form`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should submit when enterPressed is called`, async () => {
    const self = {
      $refs: { actionModal: { validateChangeStep: jest.fn() } },
    }
    DelegationModal.methods.enterPressed.call(self)
    expect(self.$refs.actionModal.validateChangeStep).toHaveBeenCalled()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    const $apollo = wrapper.vm.$apollo
    DelegationModal.methods.open.call({ $refs, $apollo })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      fromSelectedIndex: 1,
      amount: 10,
    }
    DelegationModal.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.fromSelectedIndex).toBe(0)
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
        targetValidator: validators[1],
      })
      wrapper.setData({
        amount: 10,
        fromSelectedIndex: 0,
      })
    })

    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "StakeTx",
        amount: {
          amount: 10,
          denom: "STAKE",
        },
        to: ["cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au"],
      })
    })

    it("should return empty transaction data if amount is NaN", () => {
      wrapper.setData({
        amount: `NaN`,
      })
      expect(wrapper.vm.transactionData).toEqual({})
    })

    it("should return correct notification message for delegating", () => {
      expect(wrapper.vm.notifyMessage).toEqual({
        title: `Successfully staked!`,
        body: `You have successfully staked your STAKEs`,
      })
    })
  })

  describe("Submission Data for Redelegating", () => {
    beforeEach(() => {
      wrapper.setProps({
        targetValidator: validators[2],
      })
      wrapper.setData({
        amount: 10,
        fromSelectedIndex: 2,
      })
    })

    it("should set the subtotal to 0 on a restake", () => {
      expect(wrapper.html()).toMatchSnapshot()
    })

    it("should return correct transaction data for redelegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "RestakeTx",
        amount: {
          amount: 10,
          denom: "STAKE",
        },
        from: ["cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au"],
        to: ["cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n"],
      })
    })

    it("should return correct notification message for delegating", () => {
      expect(wrapper.vm.notifyMessage).toEqual({
        title: `Successfully restaked!`,
        body: `You have successfully restaked your STAKEs`,
      })
    })

    it(`should send an event on success`, () => {
      const self = {
        $emit: jest.fn(),
        $store: {
          dispatch: jest.fn(),
        },
        currentNetwork: {
          network_type: "polkadot",
        },
      }
      DelegationModal.methods.onSuccess.call(self)
      expect(self.$emit).toHaveBeenCalledWith(
        "success",
        expect.objectContaining({})
      )
    })

    it(`re register notifications on success`, () => {
      const self = {
        $emit: jest.fn(),
        $store: {
          dispatch: jest.fn(),
        },
        currentNetwork: {
          network_type: "polkadot",
        },
      }
      DelegationModal.methods.onSuccess.call(self)
      expect(self.$store.dispatch).toHaveBeenCalledWith(
        "updateNotificationRegistrations"
      )
    })
  })

  describe(`if amount field max button clicked`, () => {
    it(`amount has to be 1000 atom`, async () => {
      wrapper.setData({
        amount: 1,
        fromSelectedIndex: `0`,
      })
      wrapper.vm.setMaxAmount()
      expect(wrapper.vm.amount).toBe(1000)
    })
    it(`should show warning message`, async () => {
      wrapper.setData({
        amount: 1000,
        fromSelectedIndex: `0`,
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
        targetValidator: validators[2], // Jailed validator
      })
      wrapper.setData({
        amount: 1,
        fromSelectedIndex: `0`,
      })
      expect(wrapper.html()).toContain(
        "You are about to stake to an inactive validator (temporally banned from the network)"
      )
    })
  })

  describe(`if validator is tombstoned`, () => {
    it(`must show warn message about it`, async () => {
      wrapper.setProps({
        targetValidator: validators[3], // Tombstoned validator
      })
      wrapper.setData({
        amount: 1,
        fromSelectedIndex: `0`,
      })
      expect(wrapper.html()).toContain(
        "You are about to stake to an inactive validator (banned from the network)"
      )
    })
  })

  describe(`if validator is active`, () => {
    it(`must not show warn message`, async () => {
      wrapper.setData({
        amount: 1,
        fromSelectedIndex: `0`,
        targetValidator: validators[0], // Active validator
      })
      expect(wrapper.html()).not.toContain(
        "You are about to stake to an inactive validator"
      )
      expect(wrapper.find("#to .tm-form-msg--desc").exists()).toBe(false)
    })
  })

  describe(`if network is polkadot`, () => {
    it(`amount should be required if address is stash`, async () => {
      wrapper.vm.$store.state.session.addressRole = `stash`
      wrapper.vm.$store.getters.currentNetwork.network_type = "polkadot"
      wrapper.setData({
        amount: 0,
        fromSelectedIndex: `0`,
        targetValidator: validators[0], // Active validator
      })
      expect(wrapper.vm.validateForm()).toBe(false)
    })
    it(`amount should not be required if address is controller`, async () => {
      wrapper.vm.$store.state.session.addressRole = `controller`
      wrapper.vm.$store.getters.currentNetwork.network_type = "polkadot"
      wrapper.setData({
        amount: 0,
        fromSelectedIndex: `0`,
        targetValidator: validators[0], // Active validator
      })
      expect(wrapper.vm.validateForm()).toBe(true)
    })
  })
})
