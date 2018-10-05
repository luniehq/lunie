"use strict"

import htmlBeautify from "html-beautify"
import { createLocalVue, mount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import UndelegationModal from "staking/UndelegationModal"

// Create an example stake modal window.
const getters = {
  bondingDenom: `atom`
}

const Wrapper = () => {
  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters
  }

  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  return mount(UndelegationModal, {
    localVue,
    propsData: {
      maximum: 100,
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

test(`the "amount" field defaults to 0`, () => {
  expect(Number(Wrapper().vm.amount)).toEqual(0)
})

test(`display the 'To' address`, () => {
  expect(Wrapper().find(`#to`).element.value).toEqual(
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
  )
})

test(`unstake button emits the unstake signal`, () => {
  const wrapper = Wrapper()
  wrapper.setData({ amount: 50 })
  wrapper.vm.onUndelegate()

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
      name: `update:showUndelegationModal`,
      args: [false]
    }
  ])
})

test(`X button emits close signal`, () => {
  const wrapper = Wrapper()
  wrapper.vm.close()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: `update:showUndelegationModal`,
      args: [false]
    }
  ])
})
