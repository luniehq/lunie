"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalDeposit`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(ModalDeposit, {
      localVue,
      propsData: {
        proposalId: lcdClientMock.state.proposals[0].proposal_id,
        proposalTitle: lcdClientMock.state.proposals[0].title
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
  })

  describe(`enables or disables 'Deposit' button correctly`, () => {
    it(`disables the 'Deposit' button`, () => {
      // default values
      let depositBtn = wrapper.find(`#submit-deposit`)
      expect(depositBtn.html()).not.toContain(`disabled="disabled"`)

      // amount deposited less than the user's balance
      wrapper.setData({ amount: 1 })
      // TODO get wallet balance
      depositBtn = wrapper.find(`#submit-deposit`)
      expect(depositBtn.html()).not.toContain(`disabled="disabled"`)
    })

    it(`enables the 'Deposit' button if the user has enough balance`, () => {
      wrapper.setData({ amount: 100 })
      let submitButton = wrapper.find(`#submit-deposit`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)
    })
  })

  describe(`closes modal correctly`, () => {
    it(`X button emits close signal`, () => {
      wrapper.vm.close()
      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `update:showModalDeposit`,
          args: [false]
        }
      ])
    })
  })

  describe(`Deposit`, () => {
    it(`Deposit button casts a deposit and closes modal`, () => {
      wrapper.setData({ amount: 10 })
      wrapper.vm.onDeposit()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `submitDeposit`,
          args: [{ amount: 10 }]
        },
        {
          name: `update:showModalDeposit`,
          args: [false]
        }
      ])
    })
  })
})
