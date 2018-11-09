"use strict"

import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import { mount } from "@vue/test-utils"

let proposal = lcdClientMock.state.proposals[0]
let status = {
  button: null,
  message: `This proposal has passed`,
  color: `green`
}

describe(`PageProposal`, () => {
  describe(`with magic`, () => {
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
        expect(wrapper.find(`#vote-btn`).exists()).toEqual(false)
      })
    })
  })

  describe(`without magic`, () => {
    describe(`Vote`, () => {
      describe(`unit`, () => {
        it(`success`, async () => {
          const $store = {
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: {
              bondingDenom: `atom`,
              totalAtoms: 100,
              user: { atoms: 42 }
            }
          }

          const wrapper = mount(PageProposal, {
            mocks: { $store },
            propsData: {
              proposal: lcdClientMock.state.proposals[0],
              status: { message: `message` }
            }
          })

          await wrapper.vm.castVote({ option: `no_with_veto` })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitVote`, { option: `no_with_veto`, proposalId: `1` }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                body: `You have successfully voted no_with_veto on proposal #1`,
                title: `Successful vote!`
              }
            ]
          ])
        })

        it(`error`, async () => {
          const dispatch = jest.fn(() => {
            throw new Error(`one\ntwo\nthree\nfour\nfive\nsix\nseven`)
          })

          const $store = {
            commit: jest.fn(),
            dispatch,
            getters: {
              bondingDenom: `atom`,
              totalAtoms: 100,
              user: { atoms: 42 }
            }
          }

          const wrapper = mount(PageProposal, {
            mocks: { $store },
            propsData: {
              proposal: lcdClientMock.state.proposals[0],
              status: { message: `message` }
            }
          })

          await wrapper.vm.castVote({ option: `abstain` })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitVote`, { option: `abstain`, proposalId: `1` }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              { body: `six`, title: `Error while voting on proposal #1` }
            ]
          ])
        })
      })
    })
  })
})
