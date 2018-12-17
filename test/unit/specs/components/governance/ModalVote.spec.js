"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalVote`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    let instance = mount(ModalVote, {
      localVue,
      propsData: {
        proposalId: `1`,
        proposalTitle: lcdClientMock.state.proposals[`1`].title
      }
    })
    wrapper = instance.wrapper
  })

  describe(`component matches snapshot`, () => {
    it(`has the expected html structure`, async () => {
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  describe(`default values are set correctly`, () => {
    it(`the 'option' defaults to an empty string`, () => {
      expect(wrapper.vm.option).toEqual(``)
    })

    it(`account password defaults to an empty string`, () => {
      expect(wrapper.vm.password).toEqual(``)
    })

    it(`password is hidden by default`, () => {
      expect(wrapper.vm.showPassword).toBe(false)
    })
  })

  describe(`Password display`, () => {
    it(`toggles the password between text and password`, () => {
      wrapper.vm.togglePassword()
      expect(wrapper.vm.showPassword).toBe(true)
      wrapper.vm.togglePassword()
      expect(wrapper.vm.showPassword).toBe(false)
    })
  })

  describe(`enables or disables Vote correctly`, () => {
    it(`disables the 'Vote' button`, () => {
      // default values
      let voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // non valid option value
      wrapper.setData({ option: `other`, password: `1234567890` })
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // no password
      wrapper.setData({ option: `No`, password: `` })
      expect(voteBtn.html()).toContain(`disabled="disabled"`)
    })

    it(`enables the 'Vote' button if the user selected a valid option`, () => {
      wrapper.setData({ option: `Yes`, password: `1234567890` })
      let voteBtn = wrapper.find(`#vote-yes`)
      let submitButton = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ option: `No` })
      voteBtn = wrapper.find(`#vote-no`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ option: `NoWithVeto` })
      voteBtn = wrapper.find(`#vote-veto`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ option: `Abstain` })
      voteBtn = wrapper.find(`#vote-abstain`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)
    })
  })

  describe(`Disable already voted options`, () => {
    it(`disable button if equals the last vote: Abstain`, () => {
      wrapper.setProps({ lastVoteOption: `Abstain` })
      let voteBtn = wrapper.find(`#vote-yes`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
      voteBtn = wrapper.find(`#vote-no`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
      voteBtn = wrapper.find(`#vote-veto`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
      voteBtn = wrapper.find(`#vote-abstain`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)
    })
  })

  describe(`closes modal correctly`, () => {
    it(`X button emits close signal`, () => {
      wrapper.vm.close()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `update:showModalVote`,
          args: [false]
        }
      ])
    })
  })

  describe(`Vote`, () => {
    it(`updates the selected option on click`, () => {
      wrapper.vm.vote(`Yes`)
      expect(wrapper.vm.option).toEqual(`Yes`)

      wrapper.vm.vote(`No`)
      expect(wrapper.vm.option).toEqual(`No`)

      wrapper.vm.vote(`NoWithVeto`)
      expect(wrapper.vm.option).toEqual(`NoWithVeto`)

      wrapper.vm.vote(`Abstain`)
      expect(wrapper.vm.option).toEqual(`Abstain`)

      wrapper.vm.vote(`Abstain`)
      expect(wrapper.vm.option).toEqual(``)
    })

    it(`Vote button casts a vote and closes modal`, () => {
      wrapper.setData({ option: `Yes`, password: `1234567890` })
      wrapper.vm.onVote()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `castVote`,
          args: [{ option: `Yes`, password: `1234567890` }]
        },
        {
          name: `update:showModalVote`,
          args: [false]
        }
      ])
    })
  })
})
