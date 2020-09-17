"use strict"

import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ModalPropose from "src/ActionModal/components/ModalPropose"

describe(`ModalPropose`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive(`focus`, () => {})

  const inputs = {
    amount: 15,
    title: `A new text proposal for Cosmos`,
    description: `a valid description for the proposal`,
  }

  const balance = { denom: `ATOM`, amount: `20` }

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        userAddress: "cosmo1",
        network: "testnet",
        address: "cosmosguay",
        networks: [
          {
            id: "testnet",
            coinLookup: [
              { viewDenom: "ATOM", chainToViewConversionFactor: 0.000001 },
            ],
          },
        ],
        stakingDenom: "ATOM",
      },
      state: {},
    }
    wrapper = shallowMount(ModalPropose, {
      localVue,
      mocks: {
        $store,
      },
      propsData: {
        denom: `ATOM`,
      },
      sync: false,
    })
    wrapper.setData({ balance })
  })

  it(`should display proposal modal form`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalPropose.methods.open.call({ $refs })
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const self = {
      $v: { $reset: jest.fn() },
      title: `title`,
      description: `description`,
      amount: 10,
    }
    ModalPropose.methods.clear.call(self)
    expect(self.$v.$reset).toHaveBeenCalled()
    expect(self.title).toBe(``)
    expect(self.description).toBe(``)
    expect(self.amount).toBe(0)
  })

  it(`sends an event on success`, () => {
    const self = {
      $emit: jest.fn(),
    }
    ModalPropose.methods.onSuccess.call(self)
    expect(self.$emit).toHaveBeenCalledWith(
      "success",
      expect.objectContaining({})
    )
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with the default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if the amount for initial deposit is higher than the user's balance`, async () => {
        wrapper.setData({ amount: 250 })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if the user doesn't have the deposit coin`, async () => {
        wrapper.setData(inputs)
        wrapper.setData({ amount: 25 })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if title is blank`, () => {
        wrapper.setData(inputs)
        wrapper.setData({ title: `     ` })
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if description is blank`, () => {
        wrapper.setData({ description: `     ` })
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if title is too long disable submit button and show error message`, async () => {
        wrapper.setData({ title: `x`.repeat(65) })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if description is too long disable submit button and show error message`, async () => {
        wrapper.setData({ description: `x`.repeat(201) })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if proposal type is invalid`, () => {
        wrapper.setData(inputs)
        wrapper.setData({ type: `Other` })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`successful`, () => {
      it(`if the user has enough balance and the fields are within the length ranges`, async () => {
        wrapper.setData(inputs)
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  it(`should submit when enterPressed is called`, async () => {
    const self = {
      $refs: { actionModal: { validateChangeStep: jest.fn() } },
    }
    ModalPropose.methods.enterPressed.call(self)
    expect(self.$refs.actionModal.validateChangeStep).toHaveBeenCalled()
  })

  it(`should refocus on description when refocusOn is called`, async () => {
    const self = {
      $refs: { description: { $el: { focus: jest.fn() } } },
    }
    ModalPropose.methods.refocusOn.call(self)
    expect(self.$refs.description.$el.focus).toHaveBeenCalled()
  })

  describe("Submission Data for Delegating", () => {
    beforeEach(() => {
      wrapper.setData({
        type: "Text",
        title: "The Title",
        description: "A long description…",
        amount: 10,
      })
    })

    it("should return correct transaction data for delegating", () => {
      expect(wrapper.vm.transactionData).toEqual({
        type: "SubmitProposalTx",
        proposalDescription: "A long description…",
        proposalTitle: "The Title",
        initialDeposit: {
          amount: 10,
          denom: "ATOM",
        },
        proposer: {
          address: "cosmosguay",
          name: "",
        },
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
        title: `Successful proposal submission!`,
        body: `You have successfully submitted a new text proposal`,
      })
    })
  })
})
