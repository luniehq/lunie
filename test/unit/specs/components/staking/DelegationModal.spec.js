"use strict"

import htmlBeautify from "html-beautify"
import { createLocalVue, mount } from "@vue/test-utils"
import DelegationModal from "staking/DelegationModal"
import Vuelidate from "vuelidate"

const getters = {
  bondingDenom: `atom`
}

const Wrapper = () => {
  const $store = {
    getters
  }

  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  return mount(DelegationModal, {
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
      $store
    }
  })
}

test(`renders correctly`, () => {
  expect(htmlBeautify(Wrapper().html())).toMatchSnapshot()
})

test(`the 'amount' field defaults to 0`, () => {
  let amountField = Wrapper().find(`#amount`)
  expect(Number(amountField.element.value)).toEqual(0)
})

test(`display the 'To' address`, () => {
  let toField = Wrapper().find(`#to`)
  expect(toField.element.value).toEqual(
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
  )
})

test(`Delegation button submits delegation and closes modal`, () => {
  const wrapper = Wrapper()
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

test(`X button emits close signal`, () => {
  const wrapper = Wrapper()
  wrapper.vm.close()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: `update:showDelegationModal`,
      args: [false]
    }
  ])
})
