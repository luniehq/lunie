import proposalsModule from "src/vuex/modules/governance/proposals.js"
import { proposals, tallies } from "../json/proposals"

const mockRootState = {
  wallet: {
    balances: [
      {
        denom: `stake`,
        amount: 1000000000
      }
    ]
  },
  connection: {
    connected: true
  }
}

describe(`Module: Proposals`, () => {
  let moduleInstance

  beforeEach(() => {
    moduleInstance = proposalsModule({ node: {} })
  })

  it(`should query for proposals on reconnection if was loading before`, async () => {
    const { actions } = moduleInstance
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
    const { mutations, state } = moduleInstance
    mutations.setProposal(state, proposals[`1`])
    expect(state.proposals[`1`]).toEqual(proposals[`1`])
  })

  it(`adds a tally result to a proposal already in state`, () => {
    const { mutations, state } = moduleInstance
    mutations.setProposal(state, proposals[`2`])
    mutations.setProposalTally(state, {
      id: `2`,
      final_tally_result: tallies[`1`]
    })
    expect(state.tallies[`2`]).toEqual(tallies[`1`])
  })

  it(`replaces existing proposal with same id`, () => {
    const { mutations, state } = moduleInstance
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
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposals: () => Promise.resolve(Object.values(proposals)),
            proposalTally: id => Promise.resolve(tallies[id])
          }
        }
      })

      const { actions, state } = moduleInstance
      const commit = jest.fn()

      await actions.getProposals({
        state,
        commit,
        rootState: mockRootState
      })
      expect(commit.mock.calls).toEqual(
        expect.arrayContaining([
          [`setProposal`, proposals[`1`]],
          [`setProposalTally`, { id: `1`, final_tally_result: tallies[`1`] }],
          [`setProposal`, proposals[`2`]],
          [`setProposalTally`, { id: `2`, final_tally_result: tallies[`2`] }],
          [`setProposal`, proposals[`5`]],
          [`setProposalTally`, { id: `5`, final_tally_result: tallies[`5`] }],
          [`setProposal`, proposals[`6`]],
          [`setProposalTally`, { id: `6`, final_tally_result: tallies[`6`] }]
        ])
      )
    })

    it(`throws and stores error if the request fails`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposals: () => Promise.reject(new Error(`Error`))
          }
        }
      })
      const { actions, state } = moduleInstance
      await actions.getProposals({
        state,
        commit: () => { },
        rootState: mockRootState
      })
      expect(state.error.message).toBe(`Error`)
    })
  })

  describe(`Fetch a single proposal`, () => {
    it(`when the request is successful`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposal: id => Promise.resolve(proposals[id]),
            proposalTally: id => Promise.resolve(tallies[id])
          }
        }
      })

      const { actions, state } = moduleInstance
      const commit = jest.fn()

      // not on VotingPeriod
      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `1`
      )
      expect(commit.mock.calls).toEqual([
        [`setProposal`, proposals[`1`]],
        [`setProposalTally`, { id: `1`, final_tally_result: tallies[`1`] }]
      ])

      commit.mockClear()
      // on VotingPeriod
      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `2`
      )
      expect(commit.mock.calls).toEqual([
        [`setProposal`, proposals[`2`]],
        [`setProposalTally`, { id: `2`, final_tally_result: tallies[`2`] }]
      ])
    })

    it(`throws and stores error if the request fails`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposal: () => Promise.reject(new Error(`Error`))
          }
        }
      })

      const { actions, state } = moduleInstance
      const commit = jest.fn()

      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `1`
      )
      expect(state.error.message).toBe(`Error`)
    })
  })

  it(`optimistic update after submission`, async () => {
    const { actions, state } = moduleInstance
    jest.useFakeTimers()

    const dispatch = jest.fn()
    const commit = jest.fn()
    const proposal = proposals[1]
    await actions.postMsgSubmitProposal(
      { state, dispatch, rootState: mockRootState, commit },
      {
        txProps: {
          title: proposal.content.value.title,
          description: proposal.content.value.description,
          initialDeposits: proposal.initial_deposit
        }
      }
    )
    jest.runAllTimers()
    expect(commit).toHaveBeenCalledWith(`setProposal`, {
      id: `1`,
      content: {
        value: {
          title: `Proposal Title`,
          description: `Proposal description`
        }
      },
      initial_deposit: [
        {
          amount: "1000000000",
          denom: `stake`
        }
      ]
    })
    expect(dispatch.mock.calls[0]).toEqual([`getProposals`])
    expect(dispatch.mock.calls[1]).toEqual([`getAllTxs`])
  })
})
