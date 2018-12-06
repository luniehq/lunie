"use strict"

import setup from "../../../helpers/vuex-setup"
import UndelegationModal from "staking/UndelegationModal"
import Vuelidate from "vuelidate"

describe(`UndelegationModal`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(UndelegationModal, {
      localVue,
      propsData: {
        maximum: 100,
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
        let undelegationBtn = wrapper.find(`#submit-undelegation`)
        expect(undelegationBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if the user manually inputs a number greater than the balance`, () => {
        wrapper.setData({ amount: 142, password: `1234567890` })
        let amountField = wrapper.find(`#amount`)
        let undelegationBtn = wrapper.find(`#submit-undelegation`)
        expect(undelegationBtn.html()).toContain(`disabled="disabled"`)
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)

        amountField.trigger(`input`)
        expect(amountField.element.value).toBe(`100`)
      })

      it(`if the password field is empty`, () => {
        wrapper.setData({ amount: 10, password: `` })
        let undelegationBtn = wrapper.find(`#submit-undelegation`)
        expect(undelegationBtn.html()).toContain(`disabled="disabled"`)
      })
    })

    describe(`enables the 'Delegation' button`, () => {
      it(`if the amout is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50, password: `1234567890` })

        let undelegationBtn = wrapper.find(`#submit-undelegation`)
        expect(undelegationBtn.html()).not.toContain(`disabled="disabled"`)
      })
    })
  })

  describe(`Undelegate`, () => {
    it(`Undelegation button submits an unbonding delegation and closes modal`, () => {
      wrapper.setData({ amount: 4.2, password: `1234567890` })
      wrapper.vm.onUndelegate()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitUndelegation`,
          args: [
            {
              amount: 4.2,
              password: `1234567890`
            }
          ]
        },
        {
          name: `update:showUndelegationModal`,
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
          name: `update:showUndelegationModal`,
          args: [false]
        }
      ])
    })
  })
})
