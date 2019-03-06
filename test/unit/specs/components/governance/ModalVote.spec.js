"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`ModalVote`, () => {
  let wrapper, store
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  beforeEach(() => {
    const instance = mount(ModalVote, {
      localVue,
      propsData: {
        proposalId: `1`,
        proposalTitle: lcdClientMock.state.proposals[`1`].title
      }
    })

    instance.store.state.connection.connected = true
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setSignIn`, true)

    wrapper.vm.$refs.actionModal.open()
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`opens`, () => {
    wrapper.vm.$refs.actionModal.open = jest.fn()
    wrapper.vm.open()
    expect(wrapper.vm.$refs.actionModal.open).toHaveBeenCalled()
  })

  it(`clears on close`, () => {
    wrapper.setData({ vote: `maybe` })
    // produce validation error as vote is invalid
    wrapper.vm.$v.$touch()
    expect(wrapper.vm.$v.$error).toBe(true)

    wrapper.vm.clear()
    expect(wrapper.vm.$v.$error).toBe(false)
    expect(wrapper.vm.vote).toBe(null)
  })

  describe(`validation`, () => {
    it(`fails`, () => {
      wrapper.vm.submitForm = jest.fn()

      // default values
      expect(wrapper.vm.validateForm()).toBe(false)

      // non valid option value
      wrapper.setData({ vote: `other` })
      expect(wrapper.vm.validateForm()).toBe(false)
    })

    it(`succeeds`, async () => {
      wrapper.vm.submitForm = jest.fn()

      wrapper.setData({ vote: `Yes` })
      expect(wrapper.vm.validateForm()).toBe(true)

      wrapper.setData({ vote: `No` })
      expect(wrapper.vm.validateForm()).toBe(true)

      wrapper.setData({ vote: `NoWithVeto` })
      expect(wrapper.vm.validateForm()).toBe(true)

      wrapper.setData({ vote: `Abstain` })
      expect(wrapper.vm.validateForm()).toBe(true)
    })
  })

  describe(`Disable already voted options`, () => {
    it(`disable button if equals the last vote: Abstain`, async () => {
      wrapper.setProps({ lastVoteOption: `Abstain` })
      await wrapper.vm.$nextTick()

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

  describe(`Vote`, () => {
    it(`submits a vote`, async () => {
      wrapper.vm.$store.dispatch = jest.fn()
      wrapper.vm.$store.commit = jest.fn()

      wrapper.setData({ vote: `Yes` })
      await wrapper.vm.submitForm(`local`, `1234567890`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [
          `submitVote`,
          {
            option: `Yes`,
            proposal_id: `1`,
            password: `1234567890`,
            submitType: `local`
          }
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
