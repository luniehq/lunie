"use strict"

import moment from "moment"
import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import ModalDeposit from "renderer/components/governance/ModalDeposit"
import ModalVote from "renderer/components/governance/ModalVote"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let proposal = lcdClientMock.state.proposals[`1`]

describe(`PageProposal`, () => {
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
        store.commit(`setConnected`, true)
        store.commit(`setProposal`, proposal)
        router.push(`/governance/proposals/${proposal.proposal_id}`)
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

  it(`shows an error if the proposal couldn't be found`, () => {
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

  describe(`Proposal status`, () => {
    it(`displays correctly a proposal that 'Passed'`, () => {
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
    it(`enables voting if the proposal is on the 'VotingPeriod'`, async () => {
      let proposal = lcdClientMock.state.proposals[`2`]
      let instance = mount(PageProposal, {
        localVue,
        doBefore: ({ router, store }) => {
          store.commit(`setConnected`, true)
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

      wrapper.vm.$store.dispatch = jest.fn()
      let voteBtn = wrapper.find(`#vote-btn`)
      voteBtn.trigger(`click`)

      expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
        [`getProposalVotes`, proposal.proposal_id]
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

    it(`throws an error when trying to fetch a wrong proposalId votes`, async () => {
      wrapper.setProps({ proposalId: `3` })
      await wrapper.vm.onVote()
      expect(store.state.notifications.length).toBe(1)
      expect(store.state.notifications[0].title).toBe(`Error fetching votes`)
    })

    it(`disables voting if the proposal is on the 'DepositPeriod'`, () => {
      expect(wrapper.find(`#vote-btn`).exists()).toEqual(false)
    })
  })

  describe(`Modal onDeposit`, () => {
    it(`enables deposits if the proposal is 'Active'`, () => {
      let proposal = lcdClientMock.state.proposals[`5`]
      let instance = mount(PageProposal, {
        localVue,
        doBefore: ({ router, store }) => {
          store.commit(`setConnected`, true)
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

  it(`casts a vote`, async () => {
    wrapper.vm.$store.commit = jest.fn()
    wrapper.vm.$store.dispatch = jest.fn()

    await wrapper.vm.castVote({ option: `Abstain` })

    expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
      [`submitVote`, { option: `Abstain`, proposal_id: `1` }]
    ])

    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      [
        `notify`,
        {
          body: `You have successfully voted Abstain on proposal #1`,
          title: `Successful vote!`
        }
      ]
    ])
  })

  it(`shows an error if casting a vote fails`, async () => {
    wrapper.vm.$store.commit = jest.fn()
    wrapper.vm.$store.dispatch = jest.fn(() => {
      throw new Error(`unexpected error`)
    })

    await wrapper.vm.castVote({ option: `NoWithVeto` })

    expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
      [`submitVote`, { option: `NoWithVeto`, proposal_id: `1` }]
    ])

    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      [
        `notifyError`,
        {
          body: `unexpected error`,
          title: `Error while voting on proposal #1`
        }
      ]
    ])
  })

  it(`allows the user to deposit on a proposal`, async () => {
    wrapper.vm.$store.commit = jest.fn()
    wrapper.vm.$store.dispatch = jest.fn()

    let amount = [
      {
        amount: `15`,
        denom: `atom`
      }
    ]

    await wrapper.vm.deposit({ amount })

    expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
      [
        `submitDeposit`,
        {
          amount,
          proposal_id: `1`
        }
      ]
    ])

    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      [
        `notify`,
        {
          body: `You have successfully deposited your steaks on proposal #1`,
          title: `Successful deposit!`
        }
      ]
    ])
  })

  it(`shows an error if depositing on a proposal fails`, async () => {
    wrapper.vm.$store.commit = jest.fn()
    wrapper.vm.$store.dispatch = jest.fn(() => {
      throw new Error(`unexpected error`)
    })

    let amount = [
      {
        amount: `9`,
        denom: `atom`
      }
    ]

    await wrapper.vm.deposit({ amount })

    expect(wrapper.vm.$store.dispatch.mock.calls).toEqual([
      [
        `submitDeposit`,
        {
          amount,
          proposal_id: `1`
        }
      ]
    ])

    expect(wrapper.vm.$store.commit.mock.calls).toEqual([
      [
        `notifyError`,
        {
          body: `unexpected error`,
          title: `Error while submitting a deposit on proposal #1`
        }
      ]
    ])
  })

  it(`disables interaction buttons if not connected`, () => {
    store.commit(`setConnected`, false)

    store.commit(
      `setProposal`,
      Object.assign({}, proposal, {
        proposal_status: `VotingPeriod`
      })
    )
    wrapper.update()
    expect(
      wrapper.vm.$el.querySelector(`#vote-btn`).getAttribute(`disabled`)
    ).toBe(`disabled`)

    store.commit(
      `setProposal`,
      Object.assign({}, proposal, {
        proposal_status: `DepositPeriod`
      })
    )
    wrapper.update()
    expect(
      wrapper.vm.$el.querySelector(`#deposit-btn`).getAttribute(`disabled`)
    ).toBe(`disabled`)
  })
})
