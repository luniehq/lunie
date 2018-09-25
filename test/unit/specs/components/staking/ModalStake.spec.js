"use strict"

import htmlBeautify from "html-beautify"
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
        {
          address: "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9",
          key: "My Wallet - cosmosaccaddr…3p4mqpjyrm5ctpesxxn9",
          maximum: 100,
          value: 0
        },
        {
          address: "cosmosaccaddr126ayk3hse5zvk9gxfmpsjr9565ef72pv9g20yx",
          key: "Billy the Bill - cosmosaccaddr…psjr9565ef72pv9g20yx",
          maximum: 23.0484375481,
          value: 1
        },
        {
          address: "cosmosaccaddr18thamkhnj9wz8pa4nhnp9rldprgant57ryzag7",
          key: "Kentucky - cosmosaccaddr…np9rldprgant57ryzag7",
          maximum: 1.3788878447,
          value: 2
        }
      ],
      to: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      bondingDenom: "Stake"
    }
  })
}

test(`renders correctly`, () => {
  expect(htmlBeautify(Wrapper().html())).toMatchSnapshot()
})

test("the 'amount' field defaults to 0", () => {
  let amountField = Wrapper().find("#amount")
  expect(Number(amountField.element.value)).toEqual(0)
})

test("display the 'To' address", () => {
  let toField = Wrapper().find("#to")
  expect(toField.element.value).toEqual(
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`
  )
})

test(`Stake button emits stake and close signals`, () => {
  const wrapper = Wrapper()
  wrapper.setData({ amount: 50 })
  wrapper.vm.onStake()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: "submitDelegation",
      args: [
        {
          amount: 50,
          from: "cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9"
        }
      ]
    },
    {
      name: "update:showModalStake",
      args: [false]
    }
  ])
})

test("X button emits close signal", () => {
  const wrapper = Wrapper()
  wrapper.vm.close()

  expect(wrapper.emittedByOrder()).toEqual([
    {
      name: "update:showModalStake",
      args: [false]
    }
  ])
})
