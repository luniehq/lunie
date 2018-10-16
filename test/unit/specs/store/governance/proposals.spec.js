import proposalsModule from "renderer/vuex/modules/governance/proposals.js"
import nodeMock from "../../helpers/node_mock.js"
import BN from "bignumber.js"

describe(`Module: Delegates`, () => {
  let module
  let node

  beforeEach(() => {
    node = Object.assign({}, nodeMock)
    module = proposalsModule({ node })
  })

  it(`adds proposals to state`, () => {
    let { mutations, state } = module
    mutations.setProposals(state, [
      {
        owner: `foo`,
        tokens: `10`
      }
    ])
    expect(state.proposals).toEqual([
      {
        id: `foo`,
        owner: `foo`,
        tokens: `10`,
        voting_power: BN(10)
      }
    ])
  })

  it(`adds a new proposal to state`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, {
      owner: `foo`,
      tokens: `12`,
      updated: true
    })
    expect(state.proposals).toEqual([
      {
        id: `foo`,
        owner: `foo`,
        tokens: `12`,
        updated: true,
        voting_power: BN(12)
      }
    ])
  })

  it(`replaces existing proposal with same id`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, {
      proposal_type: `Text`,
      proposer: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
      title: `Custom text proposal`,
      description: `a very important proposal. Please everyone vote on it!`,
      initial_deposit: [
        {
          denom: `atom`,
          amount: 10
        }
      ]
    })
    expect(state.proposals).toEqual([
      {
        proposal_id: 1,
        proposal_type: `Text`,
        proposer: `cosmosaccaddr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
        title: `Custom text proposal`,
        description: `a very important proposal. Please everyone vote on it!`,
        initial_deposit: [
          {
            denom: `atom`,
            amount: 10
          }
        ]
      }
    ])
  })

  it(`fetches all proposals`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    let proposals = await actions.getProposals({ state, commit })
    expect(commit.mock.calls).toEqual([[`setProposals`, proposals]])
  })
})
