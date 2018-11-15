"use strict"

import setup from "../../../helpers/vuex-setup"
import DelegationModal from "staking/DelegationModal"
import Vuelidate from "vuelidate"

describe(`DelegationModal`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

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
        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)
      })

      it(`if the user manually inputs a number greater than the balance`, () => {
        let amountField = wrapper.find(`#amount`)
        amountField.element.value = 142

        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).toContain(`disabled="disabled"`)

        amountField.trigger(`input`)
        expect(amountField.element.value).toBe(`100`)
      })
    })

    describe(`enables the 'Delegation' button`, () => {
      it(`if the amout is positive and the user has enough balance`, () => {
        wrapper.setData({ amount: 50 })

        let delegationBtn = wrapper.find(`#submit-delegation`)
        expect(delegationBtn.html()).not.toContain(`disabled="disabled"`)
      })
    })
  })

  describe(`(Re)delegate`, () => {
    it(`Delegation button submits a (re)delegation and closes modal`, () => {
      wrapper.setData({ amount: 50 })
      wrapper.vm.onDelegation()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitDelegation`,
          args: [
            {
              amount: 50,
              from: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
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
