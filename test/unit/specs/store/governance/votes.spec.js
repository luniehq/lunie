import votesModule from "renderer/vuex/modules/governance/votes.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
const { proposals, votes, stakingParameters } = lcdClientMock.state
const addresses = lcdClientMock.addresses

const mockRootState = {
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
    module = votesModule({
      node: {}
    })
  })

  it(`adds votes to state`, () => {
    const { mutations, state } = module
    mutations.setProposalVotes(state, {
      proposalId: `1`,
      votes
    })
    expect(state.votes[`1`]).toEqual(votes)
  })

  it(`fetches all votes from a proposal`, async () => {
    module = votesModule(
      {
        node: {
          getProposalVotes: proposalId => Promise.resolve(votes[proposalId])
        }
      })
    const { actions, state } = module
    const commit = jest.fn()
    Object.keys(proposals).forEach(async (proposalId, i) => {
      await actions.getProposalVotes(
        {
          state, commit, rootState: mockRootState
        },
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
    const { actions } = module
    jest.useFakeTimers()

    const rootState = {
      stakingParameters,
      wallet: {
        address: addresses[0]
      }
    }
    const dispatch = jest.fn()
    const proposalIds = Object.keys(proposals)
    proposalIds.forEach(async (proposal_id, i) => {
      await actions.submitVote(
        {
          rootState, dispatch
        },
        {
          proposal_id, option: `Yes`
        }
      )
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `postProposalVote`,
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
        getProposalVotes: () => Promise.reject(new Error(`Error`))
      }
    })
    const { actions, state } = module
    await actions.getProposalVotes({
      state,
      commit: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error.message).toBe(`Error`)
  })
})
