"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let proposal = lcdClientMock.state.proposals[0]
let status = {
  button: null,
  message: `This proposal has passed`,
  color: `green`
}

describe(`PageProposal`, () => {
  let wrapper
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn()
  }

  beforeEach(() => {
    let instance = mount(PageProposal, {
      localVue,
      propsData: {
        proposal,
        status
      },
      $store
    })
    wrapper = instance.wrapper
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return the block number`, () => {
    expect(wrapper.vm.voteBlock).toBe(`block #135`)
  })

  it(`should return the end of the sentence`, () => {
    proposal.submit_block = `135`
    let { wrapper } = mount(PageProposal, {
      propsData: {
        proposal,
        status
      }
    })
    wrapper.update()
    expect(wrapper.vm.voteBlock).toBe(`the same block`)
  })

  describe(`Modal onVote`, () => {
    it(`enables voting if the proposal is Active`, () => {
      let status = { button: `vote` }
      wrapper.setProps({ status })

      let voteBtn = wrapper.find(`#vote-btn`)
      voteBtn.trigger(`click`)
      expect(wrapper.contains(ModalVote)).toEqual(true)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
    })

    it(`disables voting if the proposal is Pending deposits`, () => {
      let status = { button: `deposit` }
      wrapper.setProps({ status })

      let voteBtn = wrapper.find(`#vote-btn`)
      expect(Object.keys(voteBtn)).not.toContain(`vnode`, `element`, `options`)
      expect(wrapper.contains(ModalVote)).toEqual(false)
    })
  })

  describe(`Vote`, () => {
    describe(`unit`, () => {
      it(`success`, async () => {
        let option = `no_with_veto`

        $store.dispatch.mockClear()
        await wrapper.vm.castVote({ option })

        expect($store.dispatch.mock.calls).toEqual([[`submitVote`, { option }]])

        expect($store.commit.mock.calls).toEqual([
          [
            `notify`,
            {
              body: `You have successfully voted ${option} on proposal #${
                wrapper.vm.proposalId
              }`,
              title: `Successful vote!`
            }
          ]
        ])
      })

      it(`error`, async () => {
        let option = `abstain`

        $store.dispatch.mockClear()
        $store.dispatch = jest.fn(() => {
          throw new Error(`one\ntwo\nthree\nfour\nfive\nsix\nseven`)
        })

        await wrapper.vm.castVote({ option })

        expect($store.dispatch.mock.calls).toEqual([[`submitVote`, { option }]])

        expect($store.commit.mock.calls).toEqual([
          [
            `notify`,
            {
              title: `Error while voting on proposal #${wrapper.vm.proposalId}`,
              body: `something`
            }
          ]
        ])
      })
    })
  })
})
