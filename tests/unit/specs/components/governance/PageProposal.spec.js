"use strict"

import PageProposal from "governance/PageProposal"
import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuex from "vuex"
import Vuelidate from "vuelidate"

describe(`PageProposal`, () => {
  let wrapper, $store

  const localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  const state = {
    session: {
      address: `X`
    }
  }

  const getters = {
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
    const $apollo = {
      queries: {
        proposal: {
          loading: false,
          error: undefined
        },
        parameters: {
          loading: false,
          error: undefined
        }
      }
    }
    args = {
      localVue,
      propsData: {
        proposalId: `2`
      },
      mocks: {
        $store,
        $apollo
      }
    }
    wrapper = shallowMount(PageProposal, args)
  })

  it("should show a loader if the necessary data hasen't been loaded", () => {
    wrapper.vm.$apollo.queries.proposal.loading = true
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows an error if the proposal couldn't be found`, () => {
    wrapper = shallowMount(PageProposal, {
      ...args,
      propsData: { proposalId: `666` }
    })
    wrapper.setData({ error: { message: "Error" } })
    expect(wrapper.element).toMatchSnapshot()
  })

  describe(`Proposal status`, () => {
    it(`displays correctly a proposal that 'Passed'`, () => {
      wrapper.vm.proposal.status = `Passed`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Passed`,
        color: `green`
      })
    })

    it(`displays correctly a 'Rejected' proposal`, () => {
      wrapper.vm.proposal.status = `Rejected`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Rejected`,
        color: `red`
      })
    })

    it(`displays correctly a proposal on 'DepositPeriod'`, () => {
      wrapper.vm.proposal.status = `DepositPeriod`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Deposit Period`,
        color: `orange`
      })
    })

    it(`displays correctly a proposal on 'VotingPeriod'`, () => {
      wrapper.vm.proposal.status = `VotingPeriod`
      expect(wrapper.vm.status).toMatchObject({
        badge: `Voting Period`,
        color: `pink`
      })
    })

    it(`shows error status`, () => {
      wrapper.vm.proposal.status = ``
      expect(wrapper.vm.status).toMatchObject({
        badge: `Error`,
        color: `grey`
      })
    })
  })

  describe(`Modal onVote`, () => {
    it(`enables voting if the proposal is on the 'VotingPeriod'`, async () => {
      wrapper.setData({
        proposal: Object.assign({}, wrapper.vm.proposal, {
          status: "VotingPeriod"
        })
      })
      expect(wrapper.html()).toMatchSnapshot()
    })

    it(`shows the last valid vote`, async () => {
      wrapper.setData({ vote: "Yes" })
      expect(wrapper.html()).toMatchSnapshot()
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
