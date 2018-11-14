import proposalsModule from "renderer/vuex/modules/governance/proposals.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let proposals = lcdClientMock.state.proposals
let addresses = lcdClientMock.addresses

describe(`Module: Proposals`, () => {
  let module

  beforeEach(() => {
    module = proposalsModule({ node: {} })
  })

  it(`should query for proposals on reconnection if was loading before`, async () => {
    let { actions } = module
    let instance = {
      state: {
        loading: true
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).toHaveBeenCalledWith(`getProposals`)
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
    let dispatch = jest.fn()

    await actions.getProposals({ state, commit, dispatch })
    expect(commit.mock.calls).toEqual([
      [`setProposal`, proposals[0]],
      [`setProposal`, proposals[1]],
      [`setProposal`, proposals[2]]
    ])
  })

  it(`submits a new proposal`, async () => {
    let { actions } = module
    jest.useFakeTimers()

    const rootState = {
      wallet: {
        address: addresses[0]
      }
    }
    let dispatch = jest.fn()
    proposals.forEach(async (proposal, i) => {
      await actions.submitProposal({ rootState, dispatch }, proposal)
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `submitProposal`,
          proposer: addresses[0],
          proposal_type: proposal.proposal_type,
          title: proposal.title,
          description: proposal.description,
          initial_deposit: proposal.initial_deposit
        }
      ])

      jest.runAllTimers()
      expect(dispatch.mock.calls[i + proposals.length]).toEqual([
        `getProposals`
      ])
    })
  })
})
