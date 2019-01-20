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

    instance.store.state.connection.connected = true
    wrapper = instance.wrapper

    wrapper.vm.$refs.actionModal.submit = jest.fn(cb => cb())
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe(`submits form only if inputs are correct`, () => {
    it(`does not submit in cases`, async () => {
      wrapper.vm.submitForm = jest.fn()

      // default values
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).not.toHaveBeenCalled()

      // non valid option value
      wrapper.setData({ vote: `other`, password: `1234567890` })
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).not.toHaveBeenCalled()

      // no password
      wrapper.setData({ vote: `No`, password: `` })
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).not.toHaveBeenCalled()
    })

    it(`submits if the inputs are correct`, async () => {
      wrapper.vm.submitForm = jest.fn()

      wrapper.setData({ vote: `Yes`, password: `1234567890` })
      let voteBtn = wrapper.find(`#vote-yes`)
      expect(voteBtn.html()).toContain(`active`)
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).toHaveBeenCalled()
      wrapper.vm.submitForm.mockClear()

      wrapper.setData({ vote: `No` })
      voteBtn = wrapper.find(`#vote-no`)
      expect(voteBtn.html()).toContain(`active`)
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).toHaveBeenCalled()
      wrapper.vm.submitForm.mockClear()

      wrapper.setData({ vote: `NoWithVeto` })
      voteBtn = wrapper.find(`#vote-veto`)
      expect(voteBtn.html()).toContain(`active`)
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).toHaveBeenCalled()
      wrapper.vm.submitForm.mockClear()

      wrapper.setData({ vote: `Abstain` })
      voteBtn = wrapper.find(`#vote-abstain`)
      expect(voteBtn.html()).toContain(`active`)
      await wrapper.vm.$nextTick()
      wrapper.vm.validateForm()
      expect(wrapper.vm.submitForm).toHaveBeenCalled()
      wrapper.vm.submitForm.mockClear()
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
    it(`submits a vote`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ vote: `Yes`, password: `1234567890` })
      await wrapper.vm.submitForm()

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitVote`,
          { option: `Yes`, proposal_id: `1`, password: `1234567890` }
        ]
      ])

      expect(wrapper.vm.$store.commit.mock.calls).toEqual([
        [
          `notify`,
          {
            body: `You have successfully voted Yes on proposal #1`,
            title: `Successful vote!`
          }
        ]
      ])
    })
  })
})
