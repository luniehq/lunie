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

describe(`PageProposal`, () => {
  describe(`with magic`, () => {
    let wrapper, store
    let { mount, localVue } = setup()
    localVue.use(Vuelidate)

    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
    }

    beforeEach(() => {
      let instance = mount(PageProposal, {
        localVue,
        doBefore: ({ router, store }) => {
          router.push(`/governance/proposals/${proposal.proposal_id}`)
          store.commit(`setProposal`, proposal)
        },
        propsData: {
          proposalId: proposal.proposal_id
        },
        $store
      })
      wrapper = instance.wrapper
      store = instance.store
      wrapper.update()
    })

    it(`has the expected html structure`, async () => {
      await wrapper.vm.$nextTick()
      wrapper.update()
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`shows an error if the validator couldn't be found`, () => {
      let instance = mount(PageProposal, {
        doBefore: ({ router }) => {
          router.push(`/governance/proposals/${proposal.proposal_id}`)
          store.commit(`setProposal`, {})
        },
        propsData: {
          proposalId: proposal.proposal_id
        },
        getters: {
          proposal: () => []
        }
      })

      wrapper = instance.wrapper

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
        let proposal = lcdClientMock.state.proposals[1]
        let instance = mount(PageProposal, {
          localVue,
          doBefore: ({ router, store }) => {
            router.push(`/governance/proposals/${proposal.proposal_id}`)
            store.commit(`setProposal`, proposal)
          },
          propsData: {
            proposalId: proposal.proposal_id
          },
          $store
        })
        wrapper = instance.wrapper
        store = instance.store
        wrapper.update()

        let voteBtn = wrapper.find(`#vote-btn`)
        voteBtn.trigger(`click`)
        expect(wrapper.contains(ModalVote)).toEqual(true)
        expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
      })

      it(`disables voting if the proposal is on the 'DepositPeriod'`, () => {
        expect(wrapper.find(`#vote-btn`).exists()).toEqual(false)
      })
    })

    describe(`Modal onDeposit`, () => {
      it(`enables deposits if the proposal is 'Active'`, () => {
        let proposal = lcdClientMock.state.proposals[2]
        let instance = mount(PageProposal, {
          localVue,
          doBefore: ({ router, store }) => {
            router.push(`/governance/proposals/${proposal.proposal_id}`)
            store.commit(`setProposal`, proposal)
          },
          propsData: {
            proposalId: proposal.proposal_id
          },
          $store
        })
        wrapper = instance.wrapper
        store = instance.store
        wrapper.update()

        let depositBtn = wrapper.find(`#deposit-btn`)
        depositBtn.trigger(`click`)
        expect(wrapper.contains(ModalDeposit)).toEqual(true)
        expect(depositBtn.html()).not.toContain(`disabled="disabled"`)
      })

      it(`disables deposits if the proposal is not active`, () => {
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
              user: { atoms: 42 },
              proposals: lcdClientMock.state.proposals
            }
          }

          const wrapper = mount(PageProposal, {
            mocks: { $store },
            propsData: {
              proposalId: proposal.proposal_id
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
              user: { atoms: 42 },
              proposals: lcdClientMock.state.proposals
            }
          }

          const wrapper = mount(PageProposal, {
            mocks: { $store },
            propsData: {
              proposalId: lcdClientMock.state.proposals[2].proposal_id
            }
          })

          await wrapper.vm.castVote({ option: `Abstain` })

          expect($store.dispatch.mock.calls).toEqual([
            [`submitVote`, { option: `Abstain`, proposal_id: `5` }]
          ])

          expect($store.commit.mock.calls).toEqual([
            [
              `notifyError`,
              {
                body: `unexpected error`,
                title: `Error while voting on proposal #5`
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
              user: { atoms: 42 },
              proposals: lcdClientMock.state.proposals
            }
          }

          const wrapper = mount(PageProposal, {
            mocks: { $store },
            propsData: {
              proposalId: lcdClientMock.state.proposals[1].proposal_id
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
              user: { atoms: 42 },
              proposals: lcdClientMock.state.proposals
            }
          }

          const wrapper = mount(PageProposal, {
            mocks: { $store },
            propsData: {
              proposalId: lcdClientMock.state.proposals[1].proposal_id
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
