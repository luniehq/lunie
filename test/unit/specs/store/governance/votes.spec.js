import votesModule from "renderer/vuex/modules/governance/votes.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let proposals = lcdClientMock.state.proposals
let votes = lcdClientMock.state.votes

describe(`Module: Votes`, () => {
  let module

  beforeEach(() => {
    module = votesModule({ node: {} })
  })

  it(`adds votes to state`, () => {
    let { mutations, state } = module
    mutations.setProposalVotes(state, proposals[0].proposal_id, votes)
    expect(state.votes[proposals[0].proposal_id]).toEqual(votes)
  })

  it(`fetches all votes from a proposal`, async () => {
    module = votesModule({
      node: {
        queryProposalVotes: proposalId => Promise.resolve(votes[proposalId])
      }
    })
    let { actions, state } = module
    let commit = jest.fn()
    proposals.forEach(async (proposal, i) => {
      let proposalID = proposal.proposal_id
      await actions.getProposalVotes({ state, commit }, proposalID)
      expect(commit.mock.calls[i]).toEqual([
        `setProposalVotes`,
        proposalID,
        votes[proposalID]
      ])
    })
  })
})
