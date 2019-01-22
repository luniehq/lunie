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
        validator: lcdClientMock.state.candidates[0],
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
    store.state.connection.connected = true
    store.commit(`setStakingParameters`, stakingParameters.parameters)

    wrapper.vm.$refs.actionModal.submit = jest.fn(cb => cb())
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`default values are set correctly`, () => {
    it(`the 'amount' defaults to empty`, () => {
      expect(wrapper.vm.amount).toEqual(null)
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
      it(`with default values`, () => {
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      xit(`if the user manually inputs a number greater than the balance`, async () => {
        wrapper.setData({ amount: 142, password: `1234567890` })
        let amountField = wrapper.find(`#amount`)
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)

        amountField.trigger(`input`)
        expect(amountField.element.value).toBe(`142`)
      })

      it(`if the password field is empty`, () => {
        wrapper.setData({ amount: 10, password: `` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })
    })

    describe(`submits correctly`, () => {
      it(`if the amout is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50, password: `1234567890` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).toHaveBeenCalled()
      })
    })
  })

  describe(`Undelegate`, () => {
    it(`submits undelegation`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 4.2, password: `1234567890` })
      await wrapper.vm.submitForm()

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitUnbondingDelegation`,
          {
            amount: -4.2,
            validator: lcdClientMock.state.candidates[0],
            password: `1234567890`
          }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully undelegated 4.2 STAKEs.`,
            title: `Successful undelegation!`
          }
        ]
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
