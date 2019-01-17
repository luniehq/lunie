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

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`enables or disables Vote correctly`, () => {
    it(`disables the 'Vote' button`, () => {
      // default values
      let voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // non valid option value
      wrapper.setData({ vote: `other`, password: `1234567890` })
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // no password
      wrapper.setData({ vote: `No`, password: `` })
      expect(voteBtn.html()).toContain(`disabled="disabled"`)
    })

    it(`enables the 'Vote' button if the user selected a valid option`, () => {
      wrapper.setData({ vote: `Yes`, password: `1234567890` })
      let voteBtn = wrapper.find(`#vote-yes`)
      let submitButton = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ vote: `No` })
      voteBtn = wrapper.find(`#vote-no`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ vote: `NoWithVeto` })
      voteBtn = wrapper.find(`#vote-veto`)
      expect(voteBtn.html()).toContain(`active`)
      expect(submitButton.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ vote: `Abstain` })
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
    it(`Vote button casts a vote and closes modal`, () => {
      wrapper.setData({ vote: `Yes`, password: `1234567890` })
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
