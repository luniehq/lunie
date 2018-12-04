"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalPropose from "renderer/components/governance/ModalPropose"

describe(`ModalPropose`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    const coins = [
      {
        amount: `20`,
        denom: `stake`
      }
    ]
    let instance = mount(ModalPropose, {
      localVue,
      propsData: {
        denom: `stake`
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setWalletBalances`, coins)
    wrapper.update()
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      await wrapper.vm.$nextTick()
      wrapper.update()
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
  })

  describe(`enables or disables 'Create Proposal' button correctly`, () => {
    describe(`disables the 'Create Proposal' button`, () => {
      it(`with the default values`, () => {
        let proposeBtn = wrapper.find(`#submit-proposal`)
        expect(proposeBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if the amount for initial deposit is less than the user's balance`, () => {
        wrapper.setData({ amount: 25 })
        let proposeBtn = wrapper.find(`#submit-proposal`)
        expect(proposeBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if the user doesn't have the deposit coin`, () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        store.commit(`setWalletBalances`, otherCoins)
        wrapper.setData({ amount: 25 })
        let proposeBtn = wrapper.find(`#submit-proposal`)
        expect(proposeBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if title is blank`, () => {
        wrapper.setData({ title: `     ` })
        let proposeBtn = wrapper.find(`#submit-proposal`)
        expect(proposeBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if description is blank`, () => {
        wrapper.setData({ description: `     ` })
        let proposeBtn = wrapper.find(`#submit-proposal`)
        expect(proposeBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if proposal type is invalid`, () => {
        wrapper.setData({ type: `Other` })
        let proposeBtn = wrapper.find(`#submit-proposal`)
        expect(proposeBtn.html()).toContain(`disabled="disabled"`)
      })
    })

    describe(`enables the 'Create Proposal' button`, () => {
      it(`if the user has enough balance and the fields are within the length ranges`, () => {
        wrapper.setData({
          amount: 15,
          title: `A new text proposal for Cosmos`,
          description: `a valid description for the proposal`
        })
        let submitButton = wrapper.find(`#submit-proposal`)
        expect(submitButton.html()).not.toContain(`disabled="disabled"`)
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
      let proposalArgs = {
        amount: 15,
        title: `A new text proposal for Cosmos`,
        description: `a valid description for the proposal`,
        type: `Text`,
        password: `1234567890`
      }
      wrapper.setData(proposalArgs)
      wrapper.vm.onPropose()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `createProposal`,
          args: [proposalArgs]
        },
        {
          name: `update:showModalPropose`,
          args: [false]
        }
      ])
    })
  })
})
