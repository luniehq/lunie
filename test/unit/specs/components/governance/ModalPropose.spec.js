"use strict"

import setup from "../../../helpers/vuex-setup"
import ModalPropose from "renderer/components/governance/ModalPropose"

describe(`ModalPropose`, () => {
  let wrapper, store
  const { mount } = setup()

  const inputs = {
    amount: 15,
    title: `A new text proposal for Cosmos`,
    description: `a valid description for the proposal`
  }

  beforeEach(async () => {
    const coins = [
      {
        amount: `200000000`,
        denom: `stake`
      }
    ]
    const instance = mount(ModalPropose, {
      propsData: {
        denom: `stake`
      },
      sync: false
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.connection.connected = true
    store.commit(`setWalletBalances`, coins)
    store.commit(`setSignIn`, true)

    await wrapper.vm.$nextTick()
    wrapper.vm.$refs.actionModal.open()
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`opens`, () => {
    wrapper.vm.$refs.actionModal.open = jest.fn()
    wrapper.vm.open()
    expect(wrapper.vm.$refs.actionModal.open).toHaveBeenCalled()
  })

  // do when refactoring the test
  xit(`clears on close`, () => {
    wrapper.vm.$v.$reset = jest.fn()
    wrapper.setData({ title: `test`, description: `test`, amount: 5 })
    wrapper.vm.close()
    expect(wrapper.vm.$v.$reset).toHaveBeenCalled()
    expect(wrapper.vm.title).toBe(``)
    expect(wrapper.vm.description).toBe(``)
    expect(wrapper.vm.amount).toBe(0)
  })

  describe(`default values are set correctly`, () => {
    it(`the proposal type defaults to 'Text'`, () => {
      expect(wrapper.vm.type).toEqual(`Text`)
    })

    it(`the proposal title defaults to the empty string`, () => {
      expect(wrapper.vm.title).toEqual(``)
    })

    it(`the proposal type defaults to the empty string`, () => {
      expect(wrapper.vm.description).toEqual(``)
    })
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with the default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if the amount for initial deposit is higher than the user's balance`, async () => {
        wrapper.setData(inputs)
        wrapper.setData({ amount: 25 })
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
        store.commit(`setWalletBalances`, otherCoins)
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

  describe(`Propose`, () => {
    it(`submits a proposal`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData(inputs)
      await wrapper.vm.submitForm(`local`, `1234567890`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitProposal`,
          {
            description: `a valid description for the proposal`,
            initial_deposit: [{ amount: `150000000`, denom: `stake` }],
            title: `A new text proposal for Cosmos`,
            type: `Text`,
            password: `1234567890`,
            submitType: `local`
          }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully submitted a new text proposal`,
            title: `Successful proposal submission!`
          }
        ]
      ])
    })
  })
})
