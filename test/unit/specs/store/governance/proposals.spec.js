import proposalsModule from "renderer/vuex/modules/governance/proposals.js"
import { proposals, tallies } from "../json/proposals"
import { addresses } from "../json/addresses"

const mockRootState = {
  wallet: {
    address: addresses[0]
  },
  connection: {
    connected: true
  }
}

describe(`Module: Proposals`, () => {
  let proposalsModuleInstance

  beforeEach(() => {
    proposalsModuleInstance = proposalsModule({ node: {} })
  })

  it(`should query for proposals on reconnection if was loading before`, async () => {
    const { actions } = proposalsModuleInstance
    const instance = {
      state: {
        loading: true
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).toHaveBeenCalledWith(`getProposals`)
  })

  it(`adds a proposal to state`, () => {
    const { mutations, state } = proposalsModuleInstance
    mutations.setProposal(state, proposals[`1`])
    expect(state.proposals[`1`]).toEqual(proposals[`1`])
  })

  it(`adds a tally result to a proposal already in state`, () => {
    const { mutations, state } = proposalsModuleInstance
    mutations.setProposal(state, proposals[`2`])
    mutations.setProposalTally(state, {
      proposal_id: `2`,
      final_tally_result: tallies[`1`]
    })
    expect(state.tallies[`2`]).toEqual(tallies[`1`])
  })

  it(`replaces existing proposal with same id`, () => {
    const { mutations, state } = proposalsModuleInstance
    mutations.setProposal(state, proposals[`1`])
    const newProposal = JSON.parse(JSON.stringify(proposals[`1`]))
    newProposal.final_tally_result = {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    }
    mutations.setProposal(state, newProposal)
    expect(state.proposals[`1`]).toHaveProperty(`final_tally_result`, {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    })
  })

  describe(`Fetches all proposal`, () => {
    it(`when the request is successful`, async () => {
      proposalsModuleInstance = proposalsModule({
        node: {
          getProposals: () =>
            Promise.resolve(
              Object.values(proposals).map(proposal => ({
                value: proposal
              }))
            ),
          getProposalTally: proposal_id => Promise.resolve(tallies[proposal_id])
        }
      })

      const { actions, state } = proposalsModuleInstance
      const commit = jest.fn()

      await actions.getProposals({
        state,
        commit,
        rootState: mockRootState
      })
      expect(commit.mock.calls).toEqual(
        expect.arrayContaining([
          [`setProposal`, proposals[`1`]],
          [
            `setProposalTally`,
            { proposal_id: `1`, final_tally_result: tallies[`1`] }
          ],
          [`setProposal`, proposals[`2`]],
          [
            `setProposalTally`,
            { proposal_id: `2`, final_tally_result: tallies[`2`] }
          ],
          [`setProposal`, proposals[`5`]],
          [
            `setProposalTally`,
            { proposal_id: `5`, final_tally_result: tallies[`5`] }
          ],
          [`setProposal`, proposals[`6`]],
          [
            `setProposalTally`,
            { proposal_id: `6`, final_tally_result: tallies[`6`] }
          ]
        ])
      )
    })

    it(`throws and stores error if the request fails`, async () => {
      proposalsModuleInstance = proposalsModule({
        node: {
          getProposals: () => Promise.reject(new Error(`Error`))
        }
      })
      const { actions, state } = proposalsModuleInstance
      await actions.getProposals({
        state,
        commit: () => {},
        rootState: mockRootState
      })
      expect(state.error.message).toBe(`Error`)
    })
  })

  describe(`Fetch a single proposal`, () => {
    it(`when the request is successful`, async () => {
      proposalsModuleInstance = proposalsModule({
        node: {
          getProposal: proposal_id =>
            Promise.resolve({ value: proposals[proposal_id] }),
          getProposalTally: proposal_id => Promise.resolve(tallies[proposal_id])
        }
      })

      const { actions, state } = proposalsModuleInstance
      const commit = jest.fn()

      // not on VotingPeriod
      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `1`
      )
      expect(commit.mock.calls).toEqual([
        [`setProposal`, proposals[`1`]],
        [
          `setProposalTally`,
          { proposal_id: `1`, final_tally_result: tallies[`1`] }
        ]
      ])

      // on VotingPeriod
      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `2`
      )
      expect(commit.mock.calls.slice(2)).toEqual([
        [`setProposal`, proposals[`2`]],
        [
          `setProposalTally`,
          { proposal_id: `2`, final_tally_result: tallies[`2`] }
        ]
      ])
    })

    it(`throws and stores error if the request fails`, async () => {
      proposalsModuleInstance = proposalsModule({
        node: {
          getProposal: () => Promise.reject(new Error(`Error`))
        }
      })

      const { actions, state } = proposalsModuleInstance
      const commit = jest.fn()

      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `1`
      )
      expect(state.error.message).toBe(`Error`)
    })
  })

  it(`submits a new proposal`, async () => {
    const { actions } = proposalsModuleInstance
    jest.useFakeTimers()

    const dispatch = jest.fn()
    const proposalsArray = Object.values(proposals)
    proposalsArray.forEach(async (proposal, i) => {
      await actions.submitProposal(
        { dispatch, rootState: mockRootState },
        {
          type: proposal.proposal_type,
          title: proposal.title,
          description: proposal.description,
          initial_deposit: proposal.initial_deposit
        }
      )
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `postProposal`,
          proposal_type: proposal.proposal_type,
          proposer: addresses[0],
          title: proposal.title,
          description: proposal.description,
          initial_deposit: proposal.initial_deposit
        }
      ])

      jest.runAllTimers()
      expect(dispatch.mock.calls[i + proposalsArray.length]).toEqual([
        `getProposals`
      ])
    })
  })
})
