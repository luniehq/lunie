"use strict"

import setup from "../../../helpers/vuex-setup"
import DelegationModal from "staking/DelegationModal"
import Vuelidate from "vuelidate"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`DelegationModal`, () => {
  let wrapper, store
  const { stakingParameters } = lcdClientMock.state
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    const instance = mount(DelegationModal, {
      localVue,
      propsData: {
        validator: lcdClientMock.state.candidates[0],
        fromOptions: [
          {
            address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
            key: `My Wallet - cosmos…3p4mqpjyrm5ctpesxxn9`,
            maximum: 1000000000,
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
    store.commit(`setSignIn`, true)

    wrapper.vm.$refs.actionModal.open()
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`opens`, () => {
    wrapper.vm.$refs.actionModal.open = jest.fn()
    wrapper.vm.open()
    expect(wrapper.vm.$refs.actionModal.open).toHaveBeenCalled()
  })

  describe(`validation`, () => {
    describe(`fails`, () => {
      it(`with default values`, () => {
        expect(wrapper.vm.validateForm()).toBe(false)
      })

      it(`if the user manually inputs a number greater than the balance`, () => {
        wrapper.setData({ amount: 142 })
        expect(wrapper.vm.validateForm()).toBe(false)
      })
    })

    describe(`succeeds`, () => {
      it(`if the amount is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50 })
        expect(wrapper.vm.validateForm()).toBe(true)
      })
    })
  })

  describe(`(Re)delegate`, () => {
    it(`submits a delegation`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ amount: 50 })
      await wrapper.vm.submitForm(`local`, `1234567890`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitDelegation`,
          {
            amount: `500000000`,
            // validatorSrc: lcdClientMock.state.candidates[1],
            // validatorDst: lcdClientMock.state.candidates[0],
            validator_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
            password: `1234567890`,
            submitType: `local`
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

      wrapper.setData({ amount: 50, selectedIndex: 1 })
      await wrapper.vm.submitForm(`local`, `1234567890`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitRedelegation`,
          {
            amount: `500000000`,
            validatorSrc: lcdClientMock.state.candidates[0],
            validatorDst: lcdClientMock.state.candidates[0],
            submitType: `local`,
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
})
