import depositsModule from "src/vuex/modules/governance/deposits.js"
import mockValues from "tests/unit/helpers/mockValues.js"
const { proposals, deposits } = mockValues.state

const mockRootState = {
  wallet: {
    balances: [
      {
        denom: `stake`,
        amount: 100
      }
    ]
  },
  connection: {
    connected: true
  }
}

describe(`Module: Deposits`, () => {
  let module

  beforeEach(() => {
    module = depositsModule({ node: { get: {} } })
  })

  it(`adds deposits to state`, () => {
    const { mutations, state } = module
    mutations.setProposalDeposits(state, `1`, deposits)
    expect(state.deposits[`1`]).toEqual(deposits)
  })

  it(`fetches all deposits from a proposal`, async () => {
    module = depositsModule({
      node: {
        get: {
          proposalDeposits: proposalId => Promise.resolve(deposits[proposalId])
        }
      }
    })
    const { actions, state } = module
    const commit = jest.fn()
    Object.keys(proposals).forEach(async (proposal_id, i) => {
      await actions.getProposalDeposits(
        { state, commit, rootState: mockRootState },
        proposal_id
      )
      expect(commit.mock.calls[i]).toEqual([
        `setProposalDeposits`,
        proposal_id,
        deposits[proposal_id]
      ])
    })
  })

  it(`should execute post submit optimistic pdates`, async () => {
    const { actions } = module
    jest.useFakeTimers()

    const dispatch = jest.fn()
    const commit = jest.fn()
    const amount = [
      {
        denom: `stake`,
        amount: `15`
      }
    ]

    const proposalIds = Object.keys(proposals)
    const numProposals = proposalIds.length
    proposalIds.forEach(async (proposal_id, i) => {
      await actions.postMsgDeposit(
        { rootState: mockRootState, dispatch, commit },
        {
          txProps: { proposalId: proposal_id, amounts: amount }
        }
      )

      jest.runAllTimers()
      expect(commit).toHaveBeenCalledWith(`updateWalletBalance`, {
        denom: `stake`,
        amount: 85
      })
      expect(dispatch.mock.calls[i]).toEqual([
        `getProposalDeposits`,
        proposal_id
      ])
      expect(dispatch.mock.calls[i + numProposals]).toEqual([
        `getProposal`,
        proposal_id
      ])
      expect(dispatch.mock.calls[i + numProposals * 2]).toEqual([`getAllTxs`])
    })
  })

  it(`should store an error if failed to load deposits`, async () => {
    module = depositsModule({
      node: {
        get: {
          proposalDeposits: () => Promise.reject(new Error(`Error`))
        }
      }
    })
    const { actions, state } = module
    await actions.getProposalDeposits({
      state,
      rootState: mockRootState,
      commit: jest.fn()
    })
    expect(state.error.message).toBe(`Error`)
  })
})
