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
      fromOptions: [`wallet`],
      maximum: 100,
      to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
    }
  })
}

it(`displays the 'To' address`, () => {
  expect(
    Wrapper()
      .text()
      .includes(`cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`)
  )
})

it(`the "amount" field defaults to 1`, () => {
  expect(Wrapper().find(`#amount`).element.value).toEqual(`1`)
})
