import mockValues from "tests/unit/helpers/mockValues.js"
import delegationModule from "src/vuex/modules/delegation.js"

const mockRootState = {
  connection: {
    connected: true
  },
  session: {
    address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    signedIn: true
  },
  stakingParameters: mockValues.state.stakingParameters
}
let staticDateNow
describe(`Module: Delegations`, () => {
  let state, actions, mutations

  beforeEach(() => {
    const instance = delegationModule({ node: { get: {} } })
    state = instance.state
    actions = instance.actions
    mutations = instance.mutations
    staticDateNow = new Date(Date.now()).toUTCString()
  })

  it(`sets committed atoms for delegate`, () => {
    mutations.setCommittedDelegation(state, { candidateId: `foo`, value: 123 })
    expect(state.committedDelegates).toEqual({ foo: 123 })
  })

  it(`sets committed atoms for delegate to 0`, () => {
    mutations.setCommittedDelegation(state, { candidateId: `foo`, value: 123 })
    mutations.setCommittedDelegation(state, { candidateId: `foo`, value: 0 })
    expect(state.committedDelegates).toEqual({})
  })

  describe(`fetch delegation data`, () => {
    let node, commit
    beforeEach(async () => {
      node = {
        get: {
          delegations: jest.fn(
            () => mockValues.state.stake[mockValues.addresses[0]].delegations
          ),
          undelegations: jest.fn(() => [
            {
              validator_address: mockValues.validators[0],
              entries: [
                {
                  balance: `1`,
                  completion_time: staticDateNow
                }
              ]
            }
          ]),
          redelegations: jest.fn(
            () => mockValues.state.stake[mockValues.addresses[0]].redelegations
          )
        }
      }
      const instance = delegationModule({
        node
      })
      state = instance.state
      actions = instance.actions
      mutations = instance.mutations
      commit = jest.fn()

      await actions.getBondedDelegates(
        {
          state,
          rootState: mockRootState,
          commit,
          dispatch: jest.fn()
        },
        mockValues.state.candidates
      )
    })

    it(`fetches bonded delegates`, async () => {
      expect(node.get.delegations).toHaveBeenCalled()
      expect(commit).toHaveBeenCalledWith(`setCommittedDelegation`, {
        candidateId: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
        value: 14
      })
    })

    it(`fetches current undelegations`, async () => {
      expect(node.get.undelegations).toHaveBeenCalled()
      expect(commit).toHaveBeenCalledWith(`setUnbondingDelegations`, [
        {
          validator_address: mockValues.validators[0],
          entries: [
            {
              balance: `1`,
              completion_time: staticDateNow
            }
          ]
        }
      ])
    })

    it(`should remove dead delegations and undelegations`, async () => {
      mutations.setCommittedDelegation(state, {
        candidateId: mockValues.validators[2],
        value: 1
      })
      mutations.setUnbondingDelegations(state, [
        {
          validator_address: mockValues.validators[2],
          entries: [
            {
              balance: 1
            }
          ]
        }
      ])
      expect(state.committedDelegates[mockValues.validators[2]]).toBeTruthy()
      expect(state.unbondingDelegations[mockValues.validators[2]]).toBeTruthy()

      const commit = jest.fn()
      await actions.getBondedDelegates(
        {
          state,
          rootState: mockRootState,
          commit,
          dispatch: jest.fn()
        },
        mockValues.state.candidates
      )

      expect(commit).toHaveBeenCalledWith(`setCommittedDelegation`, {
        candidateId: mockValues.validators[2],
        value: 0
      })
      expect(commit).toHaveBeenCalledWith(`setUnbondingDelegations`, [
        {
          validator_address: mockValues.validators[0],
          entries: [
            { balance: `1`, completion_time: `Thu, 01 Jan 1970 00:00:42 GMT` }
          ]
        }
      ])
    })
  })

  describe(`queries the delegated atoms on reconnection`, () => {
    it(`when the user has logged in and is loading`, async () => {
      const dispatch = jest.fn()
      await actions.reconnected({
        state: { loading: true },
        dispatch,
        rootState: { session: { signedIn: true } }
      })
      expect(dispatch).toHaveBeenCalledWith(`getBondedDelegates`)
    })

    it(`fails if delegations are not loading`, async () => {
      const dispatch = jest.fn()
      await actions.reconnected({
        state: { loading: false },
        dispatch,
        rootState: { session: { signedIn: true } }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`getBondedDelegates`)
    })

    it(`fails if the user hasn't logged in`, async () => {
      const dispatch = jest.fn()
      await actions.reconnected({
        state: { loading: true },
        dispatch,
        rootState: { session: { signedIn: false } }
      })
      expect(dispatch).not.toHaveBeenCalledWith(`getBondedDelegates`)
    })
  })

  it(`updating delegations should not update another users state after signing out and in again`, async () => {
    jest.useFakeTimers()

    const node = {
      get: {
        delegations: jest.fn(
          () => new Promise(resolve => setTimeout(() => resolve([]), 10000))
        ),
        undelegations: jest.fn(() => []),
        redelegations: jest.fn(() => [])
      }
    }
    const instance = delegationModule({
      node
    })
    state = instance.state
    actions = instance.actions
    mutations = instance.mutations
    const commit = jest.fn()

    const rootState = JSON.parse(JSON.stringify(mockRootState))
    actions.getBondedDelegates(
      {
        state,
        rootState,
        commit,
        dispatch: jest.fn()
      },
      mockValues.state.candidates
    )

    rootState.session.address = `other_address`

    jest.runAllTimers()

    expect(commit).not.toHaveBeenCalled()
  })

  it(`should store a undelegation`, async () => {
    mutations.setUnbondingDelegations(state, [
      {
        validator_address: mockValues.validators[0],
        entries: [
          {
            balance: `100`,
            creation_height: `12`,
            completion_time: staticDateNow
          }
        ]
      }
    ])

    expect(state.unbondingDelegations[mockValues.validators[0]]).toEqual([
      {
        balance: `100`,
        creation_height: `12`,
        completion_time: staticDateNow
      }
    ])
  })

  it(`should store an error if failed to load delegations`, async () => {
    const { state, actions } = delegationModule({
      node: {
        get: {
          redelegations: () => [],
          undelegations: () => [],
          delegations: async () => Promise.reject(`Error`)
        }
      }
    })
    await actions.getBondedDelegates({
      state,
      rootState: mockRootState,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should store an error if failed to load undelegations`, async () => {
    const { state, actions } = delegationModule({
      node: {
        get: {
          delegations: () => [],
          redelegations: () => [],
          undelegations: async () => Promise.reject(`Error`)
        }
      }
    })
    await actions.getBondedDelegates({
      state,
      rootState: mockRootState,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should store an error if failed to load redelegations`, async () => {
    const { state, actions } = delegationModule({
      node: {
        get: {
          delegations: () => [],
          undelegations: () => [],
          redelegations: async () => Promise.reject(`Error`)
        }
      }
    })
    await actions.getBondedDelegates({
      state,
      rootState: mockRootState,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should load delegates and delegations if signed in`, async () => {
    const { actions } = delegationModule({ node: { get: {} } })

    const dispatch = jest.fn(() => [])

    await actions.updateDelegates({
      dispatch,
      rootState: {
        session: {
          signedIn: true
        },
        connection: {
          lastHeader: {
            height: "200"
          }
        }
      },
      state: {
        lastDelegatesUpdate: 10
      }
    })

    expect(dispatch).toHaveBeenCalledWith(`getDelegates`)
    expect(dispatch).toHaveBeenCalledWith(`getBondedDelegates`, [])
  })

  it(`should load delegations on sign in`, async () => {
    const { actions } = delegationModule({ node: { get: {} } })

    const dispatch = jest.fn(() => [])

    await actions.initializeWallet({ dispatch })

    expect(dispatch).toHaveBeenCalledWith(`updateDelegates`)
  })
})
