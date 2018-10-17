import depositsModule from "renderer/vuex/modules/governance/deposits.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let proposals = lcdClientMock.state.proposals
let deposits = lcdClientMock.state.deposits

describe(`Module: Deposits`, () => {
  let module

  beforeEach(() => {
    module = depositsModule({ node: {} })
  })

  it(`adds deposits to state`, () => {
    let { mutations, state } = module
    mutations.setProposalDeposits(state, proposals[0].proposal_id, deposits)
    expect(state.deposits[proposals[0].proposal_id]).toEqual(deposits)
  })

  it(`fetches all deposits from a proposal`, async () => {
    module = depositsModule({
      node: {
        queryProposalDeposits: proposalId =>
          Promise.resolve(deposits[proposalId])
      }
    })
    let { actions, state } = module
    let commit = jest.fn()
    proposals.forEach(async (proposal, i) => {
      let proposalID = proposal.proposal_id
      await actions.getProposalDeposits({ state, commit }, proposalID)
      expect(commit.mock.calls[i]).toEqual([
        `setProposalDeposits`,
        proposalID,
        deposits[proposalID]
      ])
    })
  })
})
