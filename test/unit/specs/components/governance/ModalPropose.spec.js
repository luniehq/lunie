"use strict"

import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import ModalPropose from "renderer/components/governance/ModalPropose"

describe(`ModalPropose`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  const inputs = {
    amount: 15,
    title: `A new text proposal for Cosmos`,
    description: `a valid description for the proposal`
  }

  beforeEach(async () => {

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        session: { signedIn: true },
        connection: { connected: true },
        bondDenom: `uatom`,
        liquidAtoms: 200000000
      }
    }
    wrapper = shallowMount(ModalPropose, {
      localVue,
      mocks: {
        $store
      },
      propsData: {
        denom: `stake`
      },
      sync: false
    })

    await wrapper.vm.$nextTick()
    wrapper.vm.$refs.actionModal.open()
  })

  it(`should display proposal modal form`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens`, () => {
    const $refs = { actionModal: { open: jest.fn() } }
    ModalPropose.methods.open.call($refs)
    expect($refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    const $v = { $reset: jest.fn() }
    const title = `title`
    const description = `description`
    const amount = 10
    ModalPropose.methods.clear.call($v, title, description, amount)
    expect($v.$reset).toHaveBeenCalled()
    expect(title).toBe(``)
    expect(description).toBe(``)
    expect(amount).toBe(0)
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with the default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if the amount for initial deposit is higher than the user's balance`, async () => {
        wrapper.setData(inputs)
        wrapper.setData({ amount: 250 })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(false)
        await wrapper.vm.$nextTick()
        const errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`if the user doesn't have the deposit coin`, async () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        wrapper.setData(inputs)
        $store.commit(`setWalletBalances`, otherCoins)
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
        await wrapper.vm.$nextTick()
        const errorMessage = wrapper.find(`input#title + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`if description is too long disable submit button and show error message`, async () => {
        wrapper.setData({ description: `x`.repeat(201) })
        await wrapper.vm.$nextTick()
        expect(wrapper.vm.validateForm()).toBe(false)
        await wrapper.vm.$nextTick()
        const errorMessage = wrapper.find(`textarea#description + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
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
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  describe(`submitForm`, () => {
    it(`submits a proposal`, async () => {
      const $store = {
        dispatch: jest.fn(),
        commit: jest.fn()
      }

      wrapper.setData({ amount: 4.2 })
      await ModalPropose.methods.submitForm.call(
        { ...inputs, type: `Text`, denom: `uatom`, $store },
        `ledger`, ``
      )

      expect($store.dispatch).toHaveBeenCalledWith(`submitProposal`,
        {
          description: `a valid description for the proposal`,
          initial_deposit: [{ amount: `15000000`, denom: `uatom` }],
          title: `A new text proposal for Cosmos`,
          type: `Text`,
          submitType: `ledger`,
          password: ``
        }
      )

      expect($store.commit).toHaveBeenCalledWith(`notify`,
        {
          body: `You have successfully submitted a new text proposal`,
          title: `Successful proposal submission!`
        }
      )
    })
  })
})
