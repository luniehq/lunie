import votesModule from "src/vuex/modules/governance/votes.js"
import lcdClientMock from "src/connectors/lcdClientMock.js"
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
    module = votesModule({ node: {} })
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
    module = votesModule({
      node: {
        get: {
          proposalVotes: proposalId => Promise.resolve(votes[proposalId])
        }
      }
    })
    const { actions, state } = module
    await Promise.all(
      Object.keys(proposals).map(async proposalId => {
        const commit = jest.fn()
        await actions.getProposalVotes(
          { state, commit, rootState: mockRootState },
          proposalId
        )
        expect(commit).toHaveBeenCalledWith(`setProposalVotes`, {
          proposalId,
          votes: votes[proposalId]
        })
      })
    )
  })

  it(`should simulate a vote transaction`, async () => {
    const { actions } = module
    const self = {
      rootState: mockRootState,
      dispatch: jest.fn(() => 123123)
    }
    const proposal_id = `1`
    const res = await actions.simulateVote(self, {
      proposal_id,
      option: `No`
    })

    expect(self.dispatch).toHaveBeenCalledWith(`simulateTx`, {
      type: `MsgVote`,
      txArguments: {
        proposal_id,
        option: `No`,
        voter: mockRootState.wallet.address
      }
    })
    expect(res).toBe(123123)
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
        { rootState, dispatch },
        { proposal_id, option: `Yes` }
      )
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `MsgVote`,
          txArguments: {
            proposal_id,
            voter: addresses[0],
            option: `Yes`
          }
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
        get: {
          proposalVotes: () => Promise.reject(new Error(`Error`))
        }
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
