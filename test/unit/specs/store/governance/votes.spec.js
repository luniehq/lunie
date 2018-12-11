import votesModule from "renderer/vuex/modules/governance/votes.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { proposals, votes } = lcdClientMock.state
let addresses = lcdClientMock.addresses

let mockRootState = {
  wallet: {
    address: addresses[0]
  },
  connection: {
    connected: true
  }
}

describe(`Module: Votes`, () => {
  let module

  beforeEach(() => {
    module = votesModule({ node: {} })
  })

  it(`adds votes to state`, () => {
    let { mutations, state } = module
    mutations.setProposalVotes(state, {
      proposalId: `1`,
      votes
    })
    expect(state.votes[`1`]).toEqual(votes)
  })

  it(`fetches all votes from a proposal`, async () => {
    module = votesModule({
      node: {
        queryProposalVotes: proposalId => Promise.resolve(votes[proposalId])
      }
    })
    let { actions, state } = module
    let commit = jest.fn()
    Object.keys(proposals).forEach(async (proposalId, i) => {
      await actions.getProposalVotes(
        { state, commit, rootState: mockRootState },
        proposalId
      )
      expect(commit.mock.calls[i]).toEqual([
        `setProposalVotes`,
        {
          proposalId,
          votes: votes[proposalId]
        }
      ])
    })
  })

  it(`submits a vote on a proposal`, async () => {
    let { actions } = module
    jest.useFakeTimers()

    const rootState = {
      config: {
        bondingDenom: `stake`
      },
      wallet: {
        address: addresses[0]
      }
    }
    let dispatch = jest.fn()
    const proposalIds = Object.keys(proposals)
    proposalIds.forEach(async (proposal_id, i) => {
      await actions.submitVote(
        { rootState, dispatch },
        { proposal_id, option: `Yes` }
      )
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `submitProposalVote`,
          to: proposal_id,
          proposal_id,
          voter: addresses[0],
          option: `Yes`
        }
      ])

      jest.runAllTimers()
      expect(dispatch.mock.calls[i + proposalIds.length]).toEqual([
        `getProposalVotes`,
        proposal_id
      ])
    })
  })

  it(`should store an error if failed to load proposals`, async () => {
    module = votesModule({
      node: {
        queryProposalVotes: () => Promise.reject(new Error(`Error`))
      }
    })
    let { actions, state } = module
    await actions.getProposalVotes({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })
})
