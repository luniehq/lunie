import proposalsModule from "renderer/vuex/modules/governance/proposals.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let proposals = lcdClientMock.state.proposals

describe(`Module: Delegates`, () => {
  let module

  beforeEach(() => {
    module = proposalsModule({ node: {} })
  })

  it(`adds proposals to state`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, proposals[0])
    expect(state.proposals[proposals[0].proposal_id]).toEqual(proposals[0])
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
    module = proposalsModule({
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
