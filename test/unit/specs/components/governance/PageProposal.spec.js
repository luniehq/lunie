"use strict"

import moment from "moment"
import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const {
  proposals,
  tallies,
  stakingParameters,
  governanceParameters
} = lcdClientMock.state
const proposal = proposals[`2`]

describe(`PageProposal`, () => {
  let wrapper, store
  const { mount, localVue } = setup()
  localVue.use(Vuelidate)
  localVue.directive(`tooltip`, () => {})
  localVue.directive(`focus`, () => {})

  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      proposals: { proposals, tallies },
      bondDenom: stakingParameters.parameters.bond_denom,
      depositDenom: governanceParameters.deposit.min_deposit[0].denom
    }
  }

  beforeEach(() => {
    const instance = mount(PageProposal, {
      localVue,
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.state.governanceParameters.loaded = true
        store.commit(`setGovParameters`, governanceParameters)
        store.commit(`setStakingParameters`, stakingParameters.parameters)
        store.commit(`setProposal`, proposal)
        store.commit(`setProposalTally`, {
          proposal_id: `2`,
          final_tally_result: tallies[`2`]
        })
      },
      propsData: { proposalId: proposal.proposal_id },
      $store,
      stubs: {
        "modal-deposit": true,
        "modal-vote": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    wrapper.vm.$refs.modalDepoist = { open: jest.fn() }
    wrapper.vm.$refs.modalVote = { open: jest.fn() }
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows an error if the proposal couldn't be found`, () => {
    const instance = mount(PageProposal, {
      doBefore: ({}) => {
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
    store = instance.store
    store.commit(`setStakingParameters`, stakingParameters.parameters)

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

  describe(`Proposal status`, () => {
    it(`displays correctly a proposal that 'Passed'`, () => {
      wrapper.vm.proposal.proposal_status = `Passed`
      expect(wrapper.vm.status).toMatchObject({
        message: `This proposal has passed`
      })
    })

    it(`displays correctly a 'Rejected' proposal`, () => {
      wrapper.vm.proposal.proposal_status = `Rejected`
      expect(wrapper.vm.status).toMatchObject({
        message: `This proposal has been rejected and voting is closed`,
        color: `red`
      })
    })

    it(`displays correctly a proposal on 'DepositPeriod'`, () => {
      wrapper.vm.proposal.proposal_status = `DepositPeriod`
      expect(wrapper.vm.status).toMatchObject({
        message: `Deposits are open for this proposal`,
        color: `yellow`
      })
    })

    it(`displays correctly a proposal on 'VotingPeriod'`, () => {
      wrapper.vm.proposal.proposal_status = `VotingPeriod`
      expect(wrapper.vm.status).toMatchObject({
        message: `Voting for this proposal is open`,
        color: `green`
      })
    })

    it(`shows error status`, () => {
      wrapper.vm.proposal.proposal_status = ``
      expect(wrapper.vm.status).toMatchObject({
        message: `There was an error determining the status of this proposal.`,
        color: `grey`
      })
    })
  })

  describe(`Modal onVote`, () => {
    it(`enables voting if the proposal is on the 'VotingPeriod'`, () => {
      const proposal = proposals[`2`]
      proposal.proposal_status = `VotingPeriod`
      const instance = mount(PageProposal, {
        localVue,
        doBefore: ({ store }) => {
          store.commit(`setConnected`, true)
          store.commit(`setProposal`, proposal)
          store.commit(`setProposalTally`, {
            proposal_id: `2`,
            final_tally_result: tallies[`2`]
          })
        },
        propsData: {
          proposalId: proposal.proposal_id
        },
        $store
      })
      wrapper = instance.wrapper
      store = instance.store

      const voteBtn = wrapper.find(`#vote-btn`)
      voteBtn.trigger(`click`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [`getProposalVotes`, `2`]
      ])
      expect(wrapper.vm.lastVote).not.toBeDefined()
      expect(wrapper.contains(ModalVote)).toEqual(true)
      expect(voteBtn.html()).not.toContain(`disabled="disabled"`)
    })

    it(`load the last valid vote succesfully`, async () => {
      wrapper.setProps({ proposalId: `1` })
      wrapper.vm.wallet.address = lcdClientMock.state.votes[`1`][0].voter
      await wrapper.vm.onVote()
      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [`getProposalVotes`, `1`]
      ])
      expect(wrapper.vm.lastVote).toBe(lcdClientMock.state.votes[`1`][0])
    })

    it(`keeps the last vote undefined if no vote to this proposal happened from the current address`, async () => {
      wrapper.setProps({ proposalId: `2` })
      await wrapper.vm.onVote()
      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [`getProposalVotes`, `2`]
      ])
      expect(wrapper.vm.lastVote).toBe(undefined)
    })

    it(`disables voting if the proposal is on the 'DepositPeriod'`, () => {
      wrapper.setProps({ proposalId: `5` })
      expect(wrapper.find(`#vote-btn`).exists()).toEqual(false)
    })
  })

  describe(`Modal onDeposit`, () => {
    it(`enables deposits if the proposal on 'DepositPeriod'`, () => {
      const proposal = proposals[`5`]
      const instance = mount(PageProposal, {
        localVue,
        doBefore: ({ store }) => {
          store.commit(`setConnected`, true)
          store.commit(`setStakingParameters`, stakingParameters.parameters)
          store.commit(`setProposal`, proposal)
          store.commit(`setProposalTally`, {
            proposal_id: `5`,
            final_tally_result: tallies[`5`]
          })
        },
        propsData: {
          proposalId: proposal.proposal_id
        },
        $store
      })
      wrapper = instance.wrapper
      store = instance.store
      store.commit(`setGovParameters`, governanceParameters)
      wrapper.vm.proposal.proposal_status = `DepositPeriod`
      const depositBtn = wrapper.find(`#deposit-btn`)
      depositBtn.trigger(`click`)
      expect(wrapper.contains(ModalDeposit)).toEqual(true)
      expect(depositBtn.html()).not.toContain(`disabled="disabled"`)
    })

    it(`disables deposits if the proposal is not active`, () => {
      expect(wrapper.find(`#deposit-btn`).exists()).toEqual(false)
    })
  })

  it(`disables interaction buttons if not connected`, () => {
    store.commit(`setConnected`, false)

    store.commit(
      `setProposal`,
      Object.assign({}, proposal, {
        proposal_status: `VotingPeriod`
      })
    )
    expect(
      wrapper.vm.$el.querySelector(`#vote-btn`).getAttribute(`disabled`)
    ).toBe(`disabled`)

    store.commit(
      `setProposal`,
      Object.assign({}, proposal, {
        proposal_status: `DepositPeriod`
      })
    )
    expect(
      wrapper.vm.$el.querySelector(`#deposit-btn`).getAttribute(`disabled`)
    ).toBe(`disabled`)
  })
})
