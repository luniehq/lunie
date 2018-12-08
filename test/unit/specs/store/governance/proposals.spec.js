import proposalsModule from "renderer/vuex/modules/governance/proposals.js"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
let proposals = lcdClientMock.state.proposals
let addresses = lcdClientMock.addresses

let mockRootState = {
  wallet: {
    address: addresses[0]
  },
  connection: {
    connected: true
  }
}

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

  it(`adds a proposal to state`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, proposals[`1`])
    expect(state.proposals[`1`]).toEqual(proposals[`1`])
  })

  it(`adds a tally result to a proposal already in state`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, proposals[`2`])
    mutations.setProposalTally(state, `2`, proposals[`1`].tally_result)
    expect(state.proposals[`2`].tally_result).toEqual(
      proposals[`1`].tally_result
    )
  })

  it(`replaces existing proposal with same id`, () => {
    let { mutations, state } = module
    mutations.setProposal(state, proposals[`1`])
    let newProposal = JSON.parse(JSON.stringify(proposals[`1`]))
    newProposal.tally_result = {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    }
    mutations.setProposal(state, newProposal)
    expect(state.proposals[`1`]).toHaveProperty(`tally_result`, {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    })
  })

  describe(`Fetches all proposal`, () => {
    it(`when the request is successful`, async () => {
      module = proposalsModule({
        node: {
          queryProposals: () =>
            Promise.resolve(
              Object.values(proposals).map(proposal => ({
                value: proposal
              }))
            )
        }
      })

      let { actions, state } = module
      let commit = jest.fn()
      let dispatch = jest.fn()

      await actions.getProposals({
        state,
        commit,
        dispatch,
        rootState: mockRootState
      })
      expect(commit.mock.calls).toEqual([
        [`setProposal`, proposals[`1`]],
        [`setProposal`, proposals[`2`]],
        [`setProposal`, proposals[`5`]],
        [`setProposal`, proposals[`6`]]
      ])
    })

    it(`throws and stores error if the request fails`, async () => {
      module = proposalsModule({
        node: {
          queryProposals: () => Promise.reject(new Error(`Error`))
        }
      })
      let { actions, state } = module
      await actions.getProposals({
        state,
        commit: jest.fn(),
        rootState: mockRootState
      })
      expect(state.error.message).toBe(`Error`)
    })
  })

  describe(`Fetch a single proposal`, () => {
    it(`when the request is successful`, async () => {
      module = proposalsModule({
        node: {
          queryProposal: proposal_id =>
            Promise.resolve({ value: proposals[proposal_id] })
        }
      })

      let { actions, state } = module
      let commit = jest.fn()
      let dispatch = jest.fn()

      await actions.getProposal(
        { state, commit, dispatch, rootState: mockRootState },
        `1`
      )
      expect(commit.mock.calls).toEqual([[`setProposal`, proposals[`1`]]])
    })

    it(`throws and stores error if the request fails`, async () => {
      module = proposalsModule({
        node: {
          queryProposal: () => Promise.reject(new Error(`Error`))
        }
      })

      let { actions, state } = module
      let commit = jest.fn()
      let dispatch = jest.fn()

      await actions.getProposal(
        { state, commit, dispatch, rootState: mockRootState },
        `1`
      )
      expect(state.error.message).toBe(`Error`)
    })
  })

  it(`submits a new proposal`, async () => {
    let { actions } = module
    jest.useFakeTimers()

    let dispatch = jest.fn()
    const proposalsArray = Object.values(proposals)
    proposalsArray.forEach(async (proposal, i) => {
      await actions.submitProposal(
        { dispatch, rootState: mockRootState },
        {
          type: proposal.proposal_type,
          title: proposal.title,
          description: proposal.description,
          initial_deposit: proposal.initial_deposit
        }
      )
      expect(dispatch.mock.calls[i]).toEqual([
        `sendTx`,
        {
          type: `submitProposal`,
          proposal_type: proposal.proposal_type,
          proposer: addresses[0],
          title: proposal.title,
          description: proposal.description,
          initial_deposit: proposal.initial_deposit
        }
      ])

      jest.runAllTimers()
      expect(dispatch.mock.calls[i + proposalsArray.length]).toEqual([
        `getProposals`
      ])
    })
  })
})
