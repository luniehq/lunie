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

  it(`replaces existing proposal with same id`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, proposals[0])
    let newProposal = JSON.parse(JSON.stringify(proposals[0]))
    newProposal.tally_result = {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    }
    mutations.setProposal(state, newProposal)
    expect(state.proposals[proposals[0].proposal_id]).toHaveProperty(
      `tally_result`,
      {
        yes: `10`,
        no: `3`,
        no_with_veto: `1`,
        abstain: `4`
      }
    )
  })

  it(`fetches all proposals`, async () => {
    module = votesModule({
      node: {
        queryProposals: () =>
          Promise.resolve(
            proposals.map(proposal => ({
              value: proposal
            }))
          )
      }
    })
    let { actions, state } = module
    let commit = jest.fn()
    await actions.getProposals({ state, commit })
    expect(commit.mock.calls).toEqual([
      [`setProposal`, proposals[0]],
      [`setProposal`, proposals[1]]
    ])
  })
})
