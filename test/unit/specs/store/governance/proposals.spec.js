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

  describe(`Fetches all proposal`, () => {
    it(`when the request is successful`, async () => {
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

      await actions.getProposals({
        state,
        commit,
        dispatch,
        rootState: mockRootState
      })
      expect(commit.mock.calls).toEqual([
        [`setProposal`, proposals[0]],
        [`setProposal`, proposals[1]],
        [`setProposal`, proposals[2]],
        [`setProposal`, proposals[3]]
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
          queryProposal: proposal_id => {
            let stateProposals = proposals.map(proposal => ({
              value: proposal
            }))

            return Promise.resolve(
              stateProposals.find(
                proposal => proposal.value.proposal_id === proposal_id
              )
            )
          }
        }
      })

      let { actions, state } = module
      let commit = jest.fn()
      let dispatch = jest.fn()

      await actions.getProposal(
        { state, commit, dispatch, rootState: mockRootState },
        `1`
      )
      expect(commit.mock.calls).toEqual([[`setProposal`, proposals[0]]])
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

    const rootState = {
      wallet: {
        address: addresses[0]
      }
    }
    let dispatch = jest.fn()
    proposals.forEach(async (proposal, i) => {
      await actions.submitProposal(
        { rootState, dispatch, rootState: mockRootState },
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
      expect(dispatch.mock.calls[i + proposals.length]).toEqual([
        `getProposals`
      ])
    })
  })
})
