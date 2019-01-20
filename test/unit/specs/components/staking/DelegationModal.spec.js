"use strict"

import setup from "../../../helpers/vuex-setup"
import DelegationModal from "staking/DelegationModal"
import Vuelidate from "vuelidate"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`DelegationModal`, () => {
  let wrapper, store
  let { stakingParameters } = lcdClientMock.state
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    let instance = mount(DelegationModal, {
      localVue,
      propsData: {
        validator: lcdClientMock.state.candidates[0],
        fromOptions: [
          {
            address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
            key: `My Wallet - cosmos…3p4mqpjyrm5ctpesxxn9`,
            maximum: 100,
            value: 0
          },
          {
            address: lcdClientMock.state.candidates[0].operator_address,
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
        to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
        denom: stakingParameters.parameters.bond_denom
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.state.connection.connected = true
    store.state.wallet.address = `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
    store.state.delegates.delegates = lcdClientMock.state.candidates
    store.commit(`setStakingParameters`, stakingParameters.parameters)

    wrapper.vm.$refs.actionModal.submit = jest.fn(cb => cb())
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`only submits on correct form`, () => {
    describe(`does not submit`, () => {
      it(`with default values`, () => {
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })

      it(`if the user manually inputs a number greater than the balance`, async () => {
        wrapper.setData({ amount: 142, password: `1234567890` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()

        await wrapper.vm.$nextTick()
        let errorMessage = wrapper.find(`input#amount + div`)
        expect(errorMessage.classes()).toContain(`tm-form-msg--error`)
      })

      it(`if the password field is empty`, () => {
        wrapper.setData({ amount: 10, password: `` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
      })
    })

    describe(`submits`, () => {
      it(`if the amount is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50, password: `1234567890` })
        wrapper.vm.submitForm = jest.fn()
        wrapper.vm.validateForm()
        expect(wrapper.vm.submitForm).toHaveBeenCalled()
      })
    })
  })

  describe(`(Re)delegate`, () => {
    it(`submits a delegation`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 50, password: `1234567890` })
      await wrapper.vm.submitForm()

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitDelegation`,
          {
            amount: `50`,
            // validatorSrc: lcdClientMock.state.candidates[1],
            // validatorDst: lcdClientMock.state.candidates[0],
            validator_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
            password: `1234567890`
          }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully delegated your STAKEs`,
            title: `Successful delegation!`
          }
        ]
      ])
    })

    it(`submits a redelegation`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 50, password: `1234567890`, selectedIndex: 1 })
      await wrapper.vm.submitForm()

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitRedelegation`,
          {
            amount: `50`,
            validatorSrc: lcdClientMock.state.candidates[0],
            validatorDst: lcdClientMock.state.candidates[0],
            password: `1234567890`
          }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully redelegated your STAKEs`,
            title: `Successful redelegation!`
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
          name: `update:showDelegationModal`,
          args: [false]
        }
      ])
    })
  })
})
