import depositsModule from "renderer/vuex/modules/governance/deposits.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { proposals, deposits } = lcdClientMock.state
let addresses = lcdClientMock.addresses

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

  it(`submits a deposit to a proposal`, async () => {
    let { actions } = module
    const rootState = {
      config: {
        bondingDenom: `stake`
      },
      wallet: {
        address: addresses[0]
      }
    }
    let dispatch = jest.fn()
    const amount = 15
    proposals.forEach(async (proposal, i) => {
      await actions.submitDeposit(
        { rootState, dispatch },
        proposal.proposal_id,
        amount
      )
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `submitDeposit`,
          proposal_id: proposal.proposal_id,
          depositer: addresses[0],
          amount: [
            {
              denom: rootState.config.bondingDenom,
              amount
            }
          ]
        }
      ])
    })
  })
})
