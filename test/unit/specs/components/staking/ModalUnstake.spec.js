"use strict"

import htmlBeautify from "html-beautify"
import { createLocalVue, mount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import ModalUnstake from "staking/ModalUnstake"

// Create an example stake modal window.
const Wrapper = () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  return mount(ModalUnstake, {
    localVue,
    propsData: {
      maximum: 100,
      to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
    }
  })
}

test(`renders correctly`, () => {
  expect(htmlBeautify(Wrapper().html())).toMatchSnapshot()
})

test(`the "amount" field defaults to 0`, () => {
  expect(Wrapper().vm.amount).toEqual(0)
})

test(`display the 'To' address`, () => {
  expect(Wrapper().find(`#to`).element.value).toEqual(
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
  )
})

test(`unstake button emits the unstake signal`, () => {
  const wrapper = Wrapper()
  wrapper.setData({ amount: 50 })
  wrapper.vm.onUnstake()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: `submitUndelegation`,
      args: [
        {
          amount: 50
        }
      ]
    },
    {
      name: `update:showModalUnstake`,
      args: [false]
    }
  ])
})
