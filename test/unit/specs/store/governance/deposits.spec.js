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
    mutations.setProposalDeposits(state, `1`, deposits)
    expect(state.deposits[`1`]).toEqual(deposits)
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

    const proposalIds = Object.keys(proposals)
    proposalIds.forEach(async (proposal_id, i) => {
      await actions.submitDeposit(
        { rootState: mockRootState, dispatch },
        { proposal_id, amount }
      )

      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `submitProposalDeposit`,
          to: proposal_id,
          proposal_id,
          depositer: addresses[0],
          amount
        }
      ])

      jest.runAllTimers()
      expect(dispatch.mock.calls[i + proposalIds.length]).toEqual([
        `getProposalDeposits`,
        proposal_id
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
