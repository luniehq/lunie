import proposalsModule from "src/vuex/modules/governance/proposals.js"
import { proposals, tallies } from "../json/proposals"

const mockRootState = {
  wallet: {
    balances: [
      {
        denom: `stake`,
        amount: 1000000000
      }
    ]
  },
  connection: {
    connected: true
  }
}
const gas = `1234567`
const gas_prices = [{ denom: `uatom`, amount: `123` }]
const password = ``
const submitType = `ledger`

describe(`Module: Proposals`, () => {
  let moduleInstance

  beforeEach(() => {
    moduleInstance = proposalsModule({ node: {} })
  })

  it(`should query for proposals on reconnection if was loading before`, async () => {
    const { actions } = moduleInstance
    const instance = {
      state: {
        loading: true
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).toHaveBeenCalledWith(`getProposals`)
  })

  it(`adds a proposal to state`, () => {
    const { mutations, state } = moduleInstance
    mutations.setProposal(state, proposals[`1`])
    expect(state.proposals[`1`]).toEqual(proposals[`1`])
  })

  it(`adds a tally result to a proposal already in state`, () => {
    const { mutations, state } = moduleInstance
    mutations.setProposal(state, proposals[`2`])
    mutations.setProposalTally(state, {
      proposal_id: `2`,
      final_tally_result: tallies[`1`]
    })
    expect(state.tallies[`2`]).toEqual(tallies[`1`])
  })

  it(`replaces existing proposal with same id`, () => {
    const { mutations, state } = moduleInstance
    mutations.setProposal(state, proposals[`1`])
    const newProposal = JSON.parse(JSON.stringify(proposals[`1`]))
    newProposal.final_tally_result = {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    }
    mutations.setProposal(state, newProposal)
    expect(state.proposals[`1`]).toHaveProperty(`final_tally_result`, {
      yes: `10`,
      no: `3`,
      no_with_veto: `1`,
      abstain: `4`
    })
  })

  describe(`Fetches all proposal`, () => {
    it(`when the request is successful`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposals: () => Promise.resolve(Object.values(proposals)),
            proposalTally: proposal_id => Promise.resolve(tallies[proposal_id])
          }
        }
      })

      const { actions, state } = moduleInstance
      const commit = jest.fn()

      await actions.getProposals({
        state,
        commit,
        rootState: mockRootState
      })
      expect(commit.mock.calls).toEqual(
        expect.arrayContaining([
          [`setProposal`, proposals[`1`]],
          [
            `setProposalTally`,
            { proposal_id: `1`, final_tally_result: tallies[`1`] }
          ],
          [`setProposal`, proposals[`2`]],
          [
            `setProposalTally`,
            { proposal_id: `2`, final_tally_result: tallies[`2`] }
          ],
          [`setProposal`, proposals[`5`]],
          [
            `setProposalTally`,
            { proposal_id: `5`, final_tally_result: tallies[`5`] }
          ],
          [`setProposal`, proposals[`6`]],
          [
            `setProposalTally`,
            { proposal_id: `6`, final_tally_result: tallies[`6`] }
          ]
        ])
      )
    })

    it(`throws and stores error if the request fails`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposals: () => Promise.reject(new Error(`Error`))
          }
        }
      })
      const { actions, state } = moduleInstance
      await actions.getProposals({
        state,
        commit: () => {},
        rootState: mockRootState
      })
      expect(state.error.message).toBe(`Error`)
    })
  })

  describe(`Fetch a single proposal`, () => {
    it(`when the request is successful`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposal: proposal_id => Promise.resolve(proposals[proposal_id]),
            proposalTally: proposal_id => Promise.resolve(tallies[proposal_id])
          }
        }
      })

      const { actions, state } = moduleInstance
      const commit = jest.fn()

      // not on VotingPeriod
      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `1`
      )
      expect(commit.mock.calls).toEqual([
        [`setProposal`, proposals[`1`]],
        [
          `setProposalTally`,
          { proposal_id: `1`, final_tally_result: tallies[`1`] }
        ]
      ])

      // on VotingPeriod
      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `2`
      )
      expect(commit.mock.calls.slice(2)).toEqual([
        [`setProposal`, proposals[`2`]],
        [
          `setProposalTally`,
          { proposal_id: `2`, final_tally_result: tallies[`2`] }
        ]
      ])
    })

    it(`throws and stores error if the request fails`, async () => {
      moduleInstance = proposalsModule({
        node: {
          get: {
            proposal: () => Promise.reject(new Error(`Error`))
          }
        }
      })

      const { actions, state } = moduleInstance
      const commit = jest.fn()

      await actions.getProposal(
        { state, commit, rootState: mockRootState },
        `1`
      )
      expect(state.error.message).toBe(`Error`)
    })
  })

  xit(`should simulate a proposal transaction`, async () => {
    const { actions } = moduleInstance
    const self = {
      rootState: mockRootState,
      dispatch: jest.fn(() => 123123)
    }
    const proposal = proposals[`1`]
    const res = await actions.simulateProposal(self, {
      type: proposal.proposal_type,
      initial_deposit: proposal.initial_deposit,
      proposal_content: {
        value: {
          title: proposal.title,
          description: proposal.description
        }
      }
    })

    expect(self.dispatch).toHaveBeenCalledWith(`simulateTx`, {
      type: `MsgSubmitProposal`,
      txArguments: {
        proposalType: proposal.proposal_type,
        initialDeposits: proposal.initial_deposit,
        title: proposal.title,
        description: proposal.description
      }
    })
    expect(res).toBe(123123)
  })

  xit(`submits a new proposal`, async () => {
    const { actions } = moduleInstance
    jest.useFakeTimers()

    const dispatch = jest.fn()
    const commit = jest.fn()
    const proposalsArray = Object.values(proposals)
    await Promise.all(
      proposalsArray.map(async (proposal, i) => {
        await actions.submitProposal(
          { dispatch, rootState: mockRootState, commit },
          {
            type: proposal.proposal_type,
            initial_deposit: proposal.initial_deposit,
            proposal_content: proposal.proposal_content,
            gas,
            gas_prices,
            submitType,
            password
          }
        )
        expect(dispatch.mock.calls[i]).toEqual([
          `sendTx`,
          {
            type: `MsgSubmitProposal`,
            txArguments: {
              proposalType: proposal.proposal_type,
              initialDeposits: proposal.initial_deposit,
              title: proposal.proposal_content.value.title,
              description: proposal.proposal_content.value.description
            },
            gas,
            gas_prices,
            submitType,
            password
          }
        ])

        jest.runAllTimers()
        expect(dispatch.mock.calls[i + proposalsArray.length]).toEqual([
          `getProposals`
        ])

        // optimistic update
        expect(commit).toHaveBeenCalledWith(`updateWalletBalance`, {
          denom: `stake`,
          amount: 1000000000 - proposal.initial_deposit[0].amount
        })
      })
    )

    // optimistic update
    expect(commit).toHaveBeenCalledWith(`setProposal`, {
      initial_deposit: [
        {
          amount: `200000000`,
          denom: `stake`
        }
      ],
      proposal_id: `1`,
      proposal_content: {
        value: {
          title: `Custom text proposal`,
          description: `custom text proposal description`
        }
      }
    })
  })
})
