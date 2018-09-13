"use strict"

import { createLocalVue, mount } from "@vue/test-utils"
import ModalStake from "staking/ModalStake"
import Vuelidate from "vuelidate"

// Create an example stake modal window.
const Wrapper = () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  return mount(ModalStake, {
    localVue,
    propsData: {
      fromOptions: [
        `My Wallet - cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
      ],
      maximum: 100,
      to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
    }
  })
}

test(`the "amount" field defaults to 1`, () => {
  expect(Wrapper().vm.amount).toEqual(1)
})

test(`display the 'To' address`, () => {
  expect(Wrapper().find(`#to`).element.value).toEqual(
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
  )
})

test(`Stake button emits stake and close signals`, () => {
  const wrapper = Wrapper()
  wrapper.setData({ amount: 50 })
  wrapper.vm.onStake()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: `submitDelegation`,
      args: [
        {
          amount: 50,
          from: `My Wallet - cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        }
      ]
    },
    {
      name: `update:showModalStake`,
      args: [false]
    }
  ])
})
