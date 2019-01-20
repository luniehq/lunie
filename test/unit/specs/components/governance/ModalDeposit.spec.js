"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalDeposit`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(async () => {
    const coins = [
      {
        amount: `20`,
        denom: `stake`
      }
    ]
    let instance = mount(ModalDeposit, {
      localVue,
      propsData: {
        proposalId: `1`,
        proposalTitle: lcdClientMock.state.proposals[`1`].title,
        denom: `stake`
      },
      sync: false
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.connection.connected = true
    store.commit(`setWalletBalances`, coins)

    await wrapper.vm.$nextTick()
    wrapper.vm.$refs.actionModal.submit = jest.fn(cb => cb())
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`default values are set correctly`, () => {
    it(`the 'amount' defaults to 0`, () => {
      expect(wrapper.vm.amount).toEqual(0)
    })

    it(`account password defaults to an empty string`, () => {
      expect(wrapper.vm.password).toEqual(``)
    })
  })

  describe(`enables or disables 'Deposit' button correctly`, () => {
    describe(`does not submit deposit`, () => {
      it(`with default values`, () => {
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`when the amount deposited higher than the user's balance`, async () => {
        wrapper.setData({ amount: 25, password: `1234567890` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`when the user doesn't have the deposited coin`, () => {
        const otherCoins = [
          {
            amount: `20`,
            denom: `otherCoin`
          }
        ]
        store.commit(`setWalletBalances`, otherCoins)
        wrapper.setData({ amount: 25, password: `1234567890` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`when the password field is empty`, () => {
        wrapper.setData({ amount: 10, password: `` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })
    })

    describe(`submits deposit`, () => {
      it(`when the user has enough balance to submit a deposit`, async () => {
        wrapper.setData({ amount: 15, password: `1234567890` })
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
          name: `update:showModalDeposit`,
          args: [false]
        }
      ])
    })
  })

  describe(`Deposit`, () => {
    it(`submits a deposit`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 10, password: `1234567890` })
      await wrapper.vm.submitForm()

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitDeposit`,
          {
            amount: [
              {
                amount: `10`,
                denom: `stake`
              }
            ],
            proposal_id: `1`,
            password: `1234567890`
          }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully deposited your stakes on proposal #1`,
            title: `Successful deposit!`
          }
        ]
      ])
    })
  })
})
