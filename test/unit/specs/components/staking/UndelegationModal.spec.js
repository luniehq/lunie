"use strict"

import setup from "../../../helpers/vuex-setup"
import UndelegationModal from "staking/UndelegationModal"
import Vuelidate from "vuelidate"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`UndelegationModal`, () => {
  let wrapper, store
  const { stakingParameters } = lcdClientMock.state
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    const instance = mount(UndelegationModal, {
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
    store.commit(`setSignIn`, true)

    wrapper.vm.$refs.actionModal.open()
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`opens`, () => {
    wrapper.vm.$refs.actionModal.open = jest.fn()
    wrapper.vm.open()
    expect(wrapper.vm.$refs.actionModal.open).toHaveBeenCalled()
  })

  describe(`default values are set correctly`, () => {
    it(`displays the user's wallet address as the default`, () => {
      const toField = wrapper.find(`#to`)
      expect(toField).toBeDefined()
      expect(toField.element.value).toEqual(
        `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
      )
    })
  })

  describe(`only submits on correct form`, () => {
    describe(`validates`, () => {
      it(`to false with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`to true if the amount is positive and the user has enough liquid atoms`, () => {
        wrapper.setData({ amount: 50 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  describe(`Undelegate`, () => {
    it(`submits undelegation`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 4.2 })
      await wrapper.vm.submitForm(`local`, `1234567890`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitUnbondingDelegation`,
          {
            amount: -4.2,
            validator: lcdClientMock.state.candidates[0],
            submitType: `local`,
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
})
