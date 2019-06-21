"use strict"

import { shallowMount, createLocalVue } from "@vue/test-utils"
import DelegationModal from "src/ActionModal/components/DelegationModal"
import Vuelidate from "vuelidate"
import lcdClientMock from "src/connectors/lcdClientMock.js"

const context = {
  url: "http://lunie.io",
  chainId: "cosmoshub",
  connected: true,
  userAddress: lcdClientMock.addresses[0],
  committedDelegations: [],
  delegates: [],
  localKeyPairName: "localKeyPairName"
}

describe(`DelegationModal`, () => {
  let wrapper
  const { stakingParameters } = lcdClientMock.state
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => {})

  const getters = {
    connection: { connected: true },
    session: {
      signedIn: true,
      address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`
    },
    stakingParameters: { parameters: stakingParameters },
    modalContext: {
      ...context,
      delegates: lcdClientMock.state.candidates
    }
  }

  beforeEach(() => {
    wrapper = shallowMount(DelegationModal, {
      localVue,
      mocks: {
        $store: { getters }
      },
      propsData: {
        validator: lcdClientMock.state.candidates[0],
        fromOptions: [
          {
            address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
            key: `My Wallet - cosmos…3p4mqpjyrm5ctpesxxn9`,
            maximum: 1000000000,
            value: 0
          },
          {
            address: lcdClientMock.state.candidates[1].operator_address,
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
    expect(wrapper.vm.$el).toMatchSnapshot()
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
        validator: lcdClientMock.state.candidates[1]
      })
    })

    //lcdClientMock.state.candidates[0].operator_address
    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "MsgDelegate",
        validator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
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

  describe("Submission Data for Redelgating", () => {
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
        validator_src_address:
          "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au",
        validator_dst_address: "cosmosDstAddress1",
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
})
