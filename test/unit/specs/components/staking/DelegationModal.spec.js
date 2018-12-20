"use strict"

import setup from "../../../helpers/vuex-setup"
import DelegationModal from "staking/DelegationModal"
import Vuelidate from "vuelidate"

describe(`DelegationModal`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    let instance = mount(DelegationModal, {
      localVue,
      propsData: {
        fromOptions: [
          {
            address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
            key: `My Wallet - cosmos…3p4mqpjyrm5ctpesxxn9`,
            maximum: 100,
            value: 0
          },
          {
            address: `cosmos126ayk3hse5zvk9gxfmpsjr9565ef72pv9g20yx`,
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
        to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
      },
      mocks: {
        $store: {
          getters: {
            bondingDenom: `atom`
          }
        }
      }
    })
    wrapper = instance.wrapper
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

    it(`displays the user's wallet address as the default`, () => {
      let toField = wrapper.find(`#to`)
      expect(toField).toBeDefined()
      expect(toField.element.value).toEqual(
        `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
      )
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

  describe(`enables or disables the Delegation button correctly`, () => {
    describe(`disables the 'Delegation' button`, () => {
      it(`with default values`, () => {
        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if the user manually inputs a number greater than the balance`, () => {
        wrapper.setData({ amount: 142, password: `1234567890` })
        let amountField = wrapper.find(`#amount`)

        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)

        amountField.trigger(`input`)
        expect(amountField.element.value).toBe(`100`)
      })

      it(`if the password field is empty`, () => {
        wrapper.setData({ amount: 10, password: `` })
        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)
      })
    })

    describe(`enables the 'Delegation' button`, () => {
      it(`if the amout is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50, password: `1234567890` })

        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).not.toContain(`disabled="disabled"`)
      })
    })
  })

  describe(`(Re)delegate`, () => {
    it(`Delegation button submits a (re)delegation and closes modal`, () => {
      wrapper.setData({ amount: 50, password: `1234567890` })
      wrapper.vm.onDelegation()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitDelegation`,
          args: [
            {
              amount: 50,
              from: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
              password: `1234567890`
            }
          ]
        },
        {
          name: `update:showDelegationModal`,
          args: [false]
        }
      ])
    })
  })

  describe(`closes modal correctly`, () => {
    it(`X button emits close signal`, () => {
      wrapper.vm.close()
      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `update:showDelegationModal`,
          args: [false]
        }
      ])
    })
  })
})
