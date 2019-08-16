"use strict"

import PageProposal from "governance/PageProposal"
import { proposals, tallies } from "../../store/json/proposals"
import { governanceParameters } from "../../store/json/parameters"
import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuex from "vuex"
import Vuelidate from "vuelidate"

const multiplier = 100000000

describe(`PageProposal`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  const state = {
    governanceParameters: { ...governanceParameters, loaded: true },
    proposals: { proposals, tallies, loaded: true },
    session: {
      signedIn: true
    },
    pool: {
      pool: {
        bonded_tokens: 10000
      }
    },
    wallet: {
      address: `X`
    }
  }

  const getters = {
    depositDenom: governanceParameters.parameters.deposit.min_deposit[0].denom,
    connected: true
  }
  let args

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters,
      state
    }
    args = {
      localVue,
      propsData: {
        proposalId: `2`
      },
      mocks: {
        $store
      }
    }
    wrapper = shallowMount(PageProposal, args)
  })

  describe(`should display proposal page`, () => {
    it(`if user has signed in`, async () => {
      wrapper = shallowMount(PageProposal, args)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`should default tally to 0 if it's not yet present `, () => {
      wrapper.vm.proposals.tallies = {}
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it("should show a loader if the necessary data hasen't been loaded", () => {
      wrapper.vm.governanceParameters.loaded = false
      expect(wrapper.vm.$el).toMatchSnapshot()

      // needed to reset as somehow this causes sideeffects
      wrapper.vm.governanceParameters.loaded = true
    })

    it("loads data if not available", () => {
      $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        state,
        getters: JSON.parse(JSON.stringify(getters))
      }
      $store.state.governanceParameters.loaded = false
      args = {
        localVue,
        propsData: {
          proposalId: `666`
        },
        mocks: {
          $store
        }
      }

      wrapper = shallowMount(PageProposal, args)

      expect($store.dispatch).toHaveBeenCalledWith("getProposal", "666")
      expect($store.dispatch).toHaveBeenCalledWith("getGovParameters")
    })
  })

  it(`renders votes in HTML when voting is open`, async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        proposals: {
          proposals,
          tallies: {
            2: {
              yes: 10 * multiplier,
              no: 20 * multiplier,
              no_with_veto: 30 * multiplier,
              abstain: 40 * multiplier
            }
          },
          loaded: true
        },
        governanceParameters: {
          loaded: true,
          ...governanceParameters
        },
        pool: {
          pool: {
            bonded_tokens: 10000
          }
        }
      },
      getters: {
        ...getters
      }
    }
    wrapper = shallowMount(PageProposal, { ...args, mocks: { $store } })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows an error if the proposal couldn't be found`, () => {
    wrapper = shallowMount(PageProposal, {
      ...args,
      propsData: { proposalId: `666` }
    })
    wrapper.setData({ governanceParameters: { loaded: true } })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return the time of submission `, () => {
    expect(wrapper.vm.submittedAgo).toEqual(`January 1st 1970, 00:00`)
  })

  it(`should return the time that voting started`, () => {
    expect(wrapper.vm.votingStartedAgo).toEqual(`January 3rd 1970, 00:00`)
  })

  describe(`Proposal status`, () => {
    it(`displays correctly a proposal that 'Passed'`, () => {
      wrapper.vm.proposal.proposal_status = `Passed`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Passed`,
        color: `green`
      })
    })

    it(`displays correctly a 'Rejected' proposal`, () => {
      wrapper.vm.proposal.proposal_status = `Rejected`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Rejected`,
        color: `red`
      })
    })

    it(`displays correctly a proposal on 'DepositPeriod'`, () => {
      wrapper.vm.proposal.proposal_status = `DepositPeriod`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Deposit Period`,
        color: `orange`
      })
    })

    it(`displays correctly a proposal on 'VotingPeriod'`, () => {
      wrapper.vm.proposal.proposal_status = `VotingPeriod`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Voting Period`,
        color: `pink`
      })
    })

    it(`shows error status`, () => {
      wrapper.vm.proposal.proposal_status = ``
      expect(wrapper.vm.status).toMatchObject({
        badge: `Error`,
        color: `grey`
      })
    })
  })

  describe(`Modal onVote`, () => {
    it(`enables voting if the proposal is on the 'VotingPeriod'`, async () => {
      $store = { dispatch: jest.fn() }

      const thisIs = {
        $refs: { modalVote: { open: () => {} } },
        $store,
        votes: {},
        proposalId: `2`,
        lastVote: undefined,
        wallet: { address: `X` }
      }

      await PageProposal.methods.onVote.call(thisIs)

      expect($store.dispatch.mock.calls).toEqual([
        [`getProposalVotes`, thisIs.proposalId]
      ])
      expect(thisIs.lastVote).toBeUndefined()
    })

    it(`load the last valid vote succesfully`, async () => {
      $store = { dispatch: jest.fn() }

      const thisIs = {
        $refs: { modalVote: { open: () => {} } },
        $store,
        votes: {
          2: [
            {
              voter: `X`,
              vote: `yes`
            }
          ]
        },
        proposalId: `2`,
        lastVote: undefined,
        wallet: { address: `X` }
      }
      expect(thisIs.lastVote).toBeUndefined()

      await PageProposal.methods.onVote.call(thisIs)

      expect($store.dispatch.mock.calls).toEqual([
        [`getProposalVotes`, thisIs.proposalId]
      ])
      expect(thisIs.lastVote).toEqual({ voter: `X`, vote: `yes` })
    })
  })

  describe(`Modal onDeposit`, () => {
    it(`opens deposit modal`, async () => {
      const self = {
        $refs: { modalDeposit: { open: jest.fn() } }
      }

      await PageProposal.methods.onDeposit.call(self)

      expect(self.$refs.modalDeposit.open).toHaveBeenCalled()
    })
  })
})
