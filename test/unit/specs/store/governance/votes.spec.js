import votesModule from "src/vuex/modules/governance/votes.js"
import lcdClientMock from "src/connectors/lcdClientMock.js"
const { proposals, votes /*stakingParameters*/ } = lcdClientMock.state

const mockRootState = {
  connection: {
    connected: true
  }
}
// const gas = `1234567`
// const gas_prices = [{ denom: `uatom`, amount: `123` }]
// const password = ``
// const submitType = `ledger`

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
