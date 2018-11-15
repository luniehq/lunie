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
    it(`the 'amount' defaults to an empty string`, () => {
      expect(wrapper.vm.amount).toEqual(0)
    })

    it(`displays the user's wallet address as the default`, () => {
      let toField = wrapper.find(`#to`)
      expect(toField).toBeDefined()
      expect(toField.element.value).toEqual(
        `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
      )
    })
  })

  describe(`enables or disables the Delegation button correctly`, () => {
    describe(`disables the 'Delegation' button`, () => {
      it(`with default values`, () => {
        let delegationBtn = wrapper.find(`#submit-undelegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if the user manually inputs a number greater than the balance`, () => {
        let amountField = wrapper.find(`#amount`)
        amountField.element.value = 142

        let delegationBtn = wrapper.find(`#submit-undelegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)

        amountField.trigger(`input`)
        expect(amountField.element.value).toBe(`100`)
      })
    })

    describe(`enables the 'Delegation' button`, () => {
      it(`if the amout is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50 })

        let delegationBtn = wrapper.find(`#submit-undelegation`)
        expect(delegationBtn.html()).not.toContain(`disabled="disabled"`)
      })
    })
  })

  describe(`Undelegate`, () => {
    it(`Undelegation button submits an unbonding delegation and closes modal`, () => {
      wrapper.setData({ amount: 4.2 })
      wrapper.vm.onUndelegate()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitUndelegation`,
          args: [
            {
              amount: 4.2
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
