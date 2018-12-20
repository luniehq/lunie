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

  beforeEach(() => {
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
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setWalletBalances`, coins)
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      await wrapper.vm.$nextTick()
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

    it(`password is hidden by default`, () => {
      expect(wrapper.vm.showPassword).toBe(false)
    })
  })

  describe(`Password display`, () => {
    it(`toggles the password between text and password`, () => {
      wrapper.vm.togglePassword()
      expect(wrapper.vm.showPassword).toBe(true)
      wrapper.vm.togglePassword()
      expect(wrapper.vm.showPassword).toBe(false)
    })
  })

  describe(`enables or disables 'Deposit' button correctly`, () => {
    describe(`disables the 'Deposit' button`, () => {
      it(`with default values`, () => {
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`when the amount deposited higher than the user's balance`, () => {
        wrapper.setData({ amount: 25, password: `1234567890` })
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
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
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`when the password field is empty`, () => {
        wrapper.setData({ amount: 10, password: `` })
        let depositBtn = wrapper.find(`#submit-deposit`)
        expect(depositBtn.html()).toContain(`disabled="disabled"`)
      })
    })

    describe(`enables the 'Deposit' button`, () => {
      it(`when the user has enough balance to submit a deposit`, () => {
        wrapper.setData({ amount: 15, password: `1234567890` })
        let submitButton = wrapper.find(`#submit-deposit`)
        expect(submitButton.html()).not.toContain(`disabled="disabled"`)
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
    it(`Deposit button casts a deposit and closes modal`, () => {
      wrapper.setData({ amount: 10 })
      wrapper.vm.onDeposit()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitDeposit`,
          args: [
            {
              amount: [
                {
                  amount: `10`,
                  denom: `stake`
                }
              ],
              password: ``
            }
          ]
        },
        {
          name: `update:showModalDeposit`,
          args: [false]
        }
      ])
    })
  })
})
