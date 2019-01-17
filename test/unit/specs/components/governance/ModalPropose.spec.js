"use strict"

import setup from "../../../helpers/vuex-setup"
import ModalPropose from "renderer/components/governance/ModalPropose"

describe(`ModalPropose`, () => {
  let wrapper, store
  let { mount } = setup()

  const proposal = {
    amount: 15,
    title: `A new text proposal for Cosmos`,
    description: `a valid description for the proposal`,
    password: `1234567890`
  }

  beforeEach(() => {
    const coins = [
      {
        amount: `20`,
        denom: `stake`
      }
    ]
    let instance = mount(ModalPropose, {
      propsData: {
        denom: `stake`
      },
      sync: false
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.connection.connected = true
    store.commit(`setWalletBalances`, coins)
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
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

    it(`the 'amount' defaults to 0`, () => {
      expect(wrapper.vm.amount).toEqual(0)
    })

    it(`account password defaults to an empty string`, () => {
      expect(wrapper.vm.password).toEqual(``)
    })
  })

  describe(`enables or disables 'Create Proposal' button correctly`, () => {
    describe(`doesn not submit proposal`, () => {
      it(`with the default values`, () => {
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if the amount for initial deposit is higher than the user's balance`, async () => {
        wrapper.setData(proposal)
        wrapper.setData({ amount: 25 })
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`if the user doesn't have the deposit coin`, async () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        wrapper.setData(proposal)
        store.commit(`setWalletBalances`, otherCoins)
        wrapper.setData({ amount: 25 })
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if title is blank`, () => {
        wrapper.setData(proposal)
        wrapper.setData({ title: `     ` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if description is blank`, () => {
        wrapper.setData({ description: `     ` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if title is too long disable submit button and show error message`, async () => {
        wrapper.setData({ title: `x`.repeat(65) })
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`input#title + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`if description is too long disable submit button and show error message`, async () => {
        wrapper.setData({ description: `x`.repeat(201) })
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`textarea#description + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`if proposal type is invalid`, () => {
        wrapper.setData(proposal)
        wrapper.setData({ type: `Other` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if the password field is empty`, () => {
        wrapper.setData(proposal)
        wrapper.setData({ password: `` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })
    })

    describe(`enables the 'Create Proposal' button`, () => {
      it(`if the user has enough balance and the fields are within the length ranges`, async () => {
        wrapper.setData(proposal)
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).toHaveBeenCalled()
      })
    })
  })

  describe(`closes modal correctly`, () => {
    it(`X button emits close signal`, () => {
      wrapper.vm.close()
      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `update:showModalPropose`,
          args: [false]
        }
      ])
    })
  })

  describe(`Propose`, () => {
    it(`'Create Proposal' button submits a new proposal and closes modal`, () => {
      wrapper.setData(proposal)
      wrapper.vm.submitForm()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `createProposal`,
          args: [{ type: `Text`, ...proposal }]
        },
        {
          name: `update:showModalPropose`,
          args: [false]
        }
      ])
    })
  })
})
