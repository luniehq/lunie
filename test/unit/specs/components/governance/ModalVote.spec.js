"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalVote`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(ModalVote, {
      localVue,
      propsData: {
        proposalId: lcdClientMock.state.proposals[0].proposal_id
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
    it(`the 'option' defaults to an empty string`, () => {
      expect(wrapper.vm.option).toEqual(``)
    })

    it(`checkbox value default to false`, () => {
      let checkbox = wrapper.find(`#checkbox`)
      expect(JSON.parse(checkbox.element.value)).toBe(false) // value is returned as string (`false`)
      expect(wrapper.vm.approve).toEqual(false)
    })
  })

  describe(`enables or disables Vote correctly`, () => {
    it(`disables the 'Vote' button`, () => {
      // default values
      let voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // selected option but hasn't approved checkbox
      wrapper.setData({ option: `yes`, approve: false })
      voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // approved checkbox but hasn't selected option
      wrapper.setData({ option: ``, approve: true })
      voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)

      // non valid option value
      wrapper.setData({ option: `other`, approve: true })
      voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).toContain(`disabled="disabled"`)
    })

    it(`enables the 'Vote' button if the user selected a valid option`, () => {
      wrapper.setData({ option: `yes`, approve: true })
      let voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ option: `no`, approve: true })
      voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ option: `no_with_veto`, approve: true })
      voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)

      wrapper.setData({ option: `abstain`, approve: true })
      voteBtn = wrapper.find(`#cast-vote`)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
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
      wrapper.vm.voteYes()
      expect(wrapper.vm.option).toEqual(`yes`)
      wrapper.vm.voteYes()
      expect(wrapper.vm.option).toEqual(``)

      wrapper.vm.voteNo()
      expect(wrapper.vm.option).toEqual(`no`)
      wrapper.vm.voteNo()
      expect(wrapper.vm.option).toEqual(``)

      wrapper.vm.voteVeto()
      expect(wrapper.vm.option).toEqual(`no_with_veto`)
      wrapper.vm.voteVeto()
      expect(wrapper.vm.option).toEqual(``)

      wrapper.vm.voteAbstain()
      expect(wrapper.vm.option).toEqual(`abstain`)
      wrapper.vm.voteAbstain()
      expect(wrapper.vm.option).toEqual(``)
    })

    it(`Vote button casts a vote and closes modal`, () => {
      wrapper.setData({ option: `yes`, approve: true })
      wrapper.vm.onVote()

      expect(wrapper.emittedByOrder()).toEqual([
        {
          name: `castVote`,
          args: [{ option: `yes` }]
        },
        {
          name: `update:showModalVote`,
          args: [false]
        }
      ])
    })

    it(`Avoids submitting a vote if the user hasn't selected the checkbox`, () => {
      wrapper.setData({ option: `yes`, approve: false })
      wrapper.vm.onVote()

      expect(wrapper.emittedByOrder()).toEqual([])
    })
  })
})
