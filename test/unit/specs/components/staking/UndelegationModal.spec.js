"use strict"

import setup from "../../../helpers/vuex-setup"
import UndelegationModal from "staking/UndelegationModal"
import Vuelidate from "vuelidate"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`UndelegationModal`, () => {
  let wrapper, store
  let { stakingParameters } = lcdClientMock.state
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    let instance = mount(UndelegationModal, {
      localVue,
      propsData: {
        maximum: 100,
        to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
        denom: stakingParameters.parameters.bond_denom,
        fromOptions: [
          {
            address: `cosmosval1234`
          }
        ]
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setStakingParameters`, stakingParameters.parameters)
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
  })

  describe(`only submits on correct form`, () => {
    describe(`does not submit`, () => {
      it(`with default values`, async () => {
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if the user manually inputs a number greater than the balance`, async () => {
        wrapper.setData({ amount: 142, password: `1234567890` })
        let amountField = wrapper.find(`#amount`)
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)

        amountField.trigger(`input`)
        expect(amountField.element.value).toBe(`142`)
      })

      it(`if the password field is empty`, async () => {
        wrapper.setData({ amount: 10, password: `` })
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })
    })

    describe(`submits correctly`, () => {
      it(`if the amout is positive and the user has enough balance`, async () => {
        wrapper.setData({ amount: 50, password: `1234567890` })
        await wrapper.vm.$nextTick()
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).toHaveBeenCalled()
      })
    })
  })

  describe(`Undelegate`, () => {
    it(`Undelegation button submits an unbonding delegation and closes modal`, () => {
      wrapper.setData({ amount: 4.2, password: `1234567890` })
      wrapper.vm.submitForm()

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
