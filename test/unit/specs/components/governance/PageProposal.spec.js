"use strict"

import moment from "moment"
import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
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

    it(`should return the time of submission `, () => {
      expect(wrapper.vm.submittedAgo).toEqual(
        moment(new Date(proposal.submit_time)).fromNow()
      )
    })

    it(`should return the time that voting started`, () => {
      expect(wrapper.vm.votingStartedAgo).toEqual(
        moment(new Date(proposal.voting_start_block)).fromNow()
      )
    })

    it(`should return the time when deposits end`, () => {
      expect(wrapper.vm.depositEndsIn).toEqual(
        moment(new Date(proposal.deposit_end_time)).fromNow()
      )
    })

    describe(`Modal onVote`, () => {
      it(`enables voting if the proposal is on the 'VotingPeriod'`, () => {
        let status = { button: `vote` }
        wrapper.setProps({ status })

        let voteBtn = wrapper.find(`#vote-btn`)
        voteBtn.trigger(`click`)
        expect(wrapper.contains(ModalVote)).toEqual(true)
        expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
      })

      it(`disables voting if the proposal is on the 'DepositPeriod'`, () => {
        let status = { button: `deposit` }
        wrapper.setProps({ status })
        expect(wrapper.find(`#vote-btn`).exists()).toEqual(false)
      })
    })

    describe(`Modal onDeposit`, () => {
      it(`enables deposits if the proposal is 'Active'`, () => {
        let status = { button: `deposit` }
        wrapper.setProps({ status })

        let depositBtn = wrapper.find(`#deposit-btn`)
        depositBtn.trigger(`click`)
        expect(wrapper.contains(ModalDeposit)).toEqual(true)
        expect(depositBtn.html()).not.toContain(`disabled="disabled"`)
      })

      it(`disables deposits if the proposal is not active`, () => {
        let status = { button: `` }
        wrapper.setProps({ status })
        expect(wrapper.find(`#deposit-btn`).exists()).toEqual(false)
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

          await wrapper.vm.castVote({ option: `NoWithVeto` })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitVote`, { option: `NoWithVeto`, proposal_id: `1` }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                body: `You have successfully voted NoWithVeto on proposal #1`,
                title: `Successful vote!`
              }
            ]
          ])
        })

        it(`error`, async () => {
          const dispatch = jest.fn(() => {
            throw new Error(`unexpected error`)
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

          await wrapper.vm.castVote({ option: `Abstain` })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitVote`, { option: `Abstain`, proposal_id: `1` }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                body: `unexpected error`,
                title: `Error while voting on proposal #1`
              }
            ]
          ])
        })
      })
    })

    describe(`Deposit`, () => {
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
              proposal: lcdClientMock.state.proposals[1],
              status: { message: `message` }
            }
          })

          let amount = [
            {
              amount: `15`,
              denom: `atom`
            }
          ]

          await wrapper.vm.deposit({ amount })

          expect($store.dispatch.mock.calls).toEqual([
            [
              `submitDeposit`,
              {
                amount,
                proposal_id: `2`
              }
            ]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notify`,
              {
                body: `You have successfully deposited your atoms on proposal #2`,
                title: `Successful deposit!`
              }
            ]
          ])
        })

        it(`error`, async () => {
          const dispatch = jest.fn(() => {
            throw new Error(`unexpected error`)
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
              proposal: lcdClientMock.state.proposals[1],
              status: { message: `message` }
            }
          })
          let amount = [
            {
              amount: `9`,
              denom: `atom`
            }
          ]

          await wrapper.vm.deposit({ amount })

          expect($store.dispatch.mock.calls).toEqual([
            [
              `submitDeposit`,
              {
                amount,
                proposal_id: `2`
              }
            ]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                body: `unexpected error`,
                title: `Error while submitting a deposit on proposal #2`
              }
            ]
          ])
        })
      })
    })
  })
})
