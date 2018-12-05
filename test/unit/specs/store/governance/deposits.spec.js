import depositsModule from "renderer/vuex/modules/governance/deposits.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let { proposals, deposits } = lcdClientMock.state
let addresses = lcdClientMock.addresses

let mockRootState = {
  wallet: {
    address: addresses[0]
  },
  connection: {
    connected: true
  }
}

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
      let proposalId = proposal.proposal_id
      await actions.getProposalDeposits(
        { state, commit, rootState: mockRootState },
        proposalId
      )
      expect(commit.mock.calls[i]).toEqual([
        `setProposalDeposits`,
        proposalId,
        deposits[proposalId]
      ])
    })
  })

  it(`submits a deposit to a proposal`, async () => {
    let { actions } = module
    jest.useFakeTimers()

    let dispatch = jest.fn()
    const amount = [
      {
        denom: `stake`,
        amount: `15`
      }
    ]

    proposals.forEach(async (proposal, i) => {
      await actions.submitDeposit(
        { rootState: mockRootState, dispatch },
        { proposal_id: proposal.proposal_id, amount }
      )

      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `submitProposalDeposit`,
          to: proposal.proposal_id,
          proposal_id: proposal.proposal_id,
          depositer: addresses[0],
          amount
        }
      ])

      jest.runAllTimers()
      expect(dispatch.mock.calls[i + proposals.length]).toEqual([
        `getProposalDeposits`,
        proposal.proposal_id
      ])
    })
  })

  it(`should store an error if failed to load deposits`, async () => {
    module = depositsModule({
      node: {
        queryProposalDeposits: () => Promise.reject(new Error(`Error`))
      }
    })
    let { actions, state } = module
    await actions.getProposalDeposits({
      state,
      rootState: mockRootState,
      commit: jest.fn()
    })
    expect(state.error.message).toBe(`Error`)
  })
})
