import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import delegationModule from "renderer/vuex/modules/delegation.js"

const mockRootState = {
  connection: {
    connected: true
  },
  session: {
    address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    signedIn: true
  },
  stakingParameters: lcdClientMock.state.stakingParameters
}

describe(`Module: Delegations`, () => {
  let state, actions, mutations

  beforeEach(() => {
    const instance = delegationModule({ node: {} })
    state = instance.state
    actions = instance.actions
    mutations = instance.mutations
  })

  it(`adds delegate to cart`, () => {
    mutations.addToCart(state, { id: `foo`, x: 1 })
    expect(state.delegates[0]).toEqual({
      id: `foo`,
      delegate: { id: `foo`, x: 1 },
      atoms: 0
    })
    expect(state.delegates.length).toBe(1)
  })

  it(`does not add delegate to cart if already exists`, () => {
    mutations.addToCart(state, { id: `foo` })
    mutations.addToCart(state, { id: `foo`, x: 1 })
    expect(state.delegates[0].id).toBe(`foo`)
    expect(state.delegates[0].x).toBe(undefined)
    expect(state.delegates.length).toBe(1)
  })

  it(`removes delegate from cart`, () => {
    mutations.addToCart(state, { id: `foo` })
    mutations.addToCart(state, { id: `bar` })
    mutations.removeFromCart(state, `foo`)
    expect(state.delegates[0]).toEqual({
      id: `bar`,
      delegate: { id: `bar` },
      atoms: 0
    })
    expect(state.delegates.length).toBe(1)
  })

  it(`sets committed atoms for delegate`, () => {
    mutations.addToCart(state, { id: `foo` })
    mutations.setCommittedDelegation(state, { candidateId: `foo`, value: 123 })
    expect(state.committedDelegates).toEqual({ foo: 123 })
  })

  it(`sets committed atoms for delegate to 0`, () => {
    mutations.addToCart(state, { id: `foo` })
    mutations.setCommittedDelegation(state, { candidateId: `foo`, value: 123 })
    mutations.setCommittedDelegation(state, { candidateId: `foo`, value: 0 })
    expect(state.committedDelegates).toEqual({})
  })

  describe(`fetch delegation data`, () => {
    let node, commit
    beforeEach(async () => {
      node = {
        getDelegations: jest.fn(
          () =>
            lcdClientMock.state.stake[lcdClientMock.addresses[0]].delegations
        ),
        getUndelegations: jest.fn(() => [
          {
            validator_address: lcdClientMock.validators[0],
            entries: [{ balance: `1`, completion_time: new Date(Date.now()).toUTCString() }],
          }
        ]),
        getRedelegations: jest.fn(
          () =>
            lcdClientMock.state.stake[lcdClientMock.addresses[0]].redelegations
        )
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
        lcdClientMock.state.candidates
      )
    })

    it(`fetches bonded delegates`, async () => {
      expect(node.getDelegations).toHaveBeenCalled()
      expect(commit).toHaveBeenCalledWith(`setCommittedDelegation`, { candidateId: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`, value: 14 })
      expect(commit).toHaveBeenCalledWith(
        `addToCart`,
        lcdClientMock.state.candidates[0]
      )
    })

    it(`fetches current undelegations`, async () => {
      expect(node.getUndelegations).toHaveBeenCalled()
      expect(commit).toHaveBeenCalledWith(`setUnbondingDelegations`, [
        {
          validator_address: lcdClientMock.validators[0],
          entries: [{ balance: `1`, completion_time: new Date(Date.now()).toUTCString() }],
        }
      ])
    })

    it(`should remove dead delegations and undelegations`, async () => {
      mutations.setCommittedDelegation(state, {
        candidateId: lcdClientMock.validators[2],
        value: 1
      })
      mutations.setUnbondingDelegations(state, [
        {
          validator_address: lcdClientMock.validators[2],
          entries: [{
            balance: 1
          }]
        }
      ])
      expect(state.committedDelegates[lcdClientMock.validators[2]]).toBeTruthy()
      expect(
        state.unbondingDelegations[lcdClientMock.validators[2]]
      ).toBeTruthy()

      const commit = jest.fn()
      await actions.getBondedDelegates(
        {
          state,
          rootState: mockRootState,
          commit,
          dispatch: jest.fn()
        },
        lcdClientMock.state.candidates
      )

      expect(commit).toHaveBeenCalledWith(`setCommittedDelegation`, {
        candidateId: lcdClientMock.validators[2],
        value: 0
      })
      expect(commit).toHaveBeenCalledWith(`setUnbondingDelegations`, [
        {
          validator_address: lcdClientMock.validators[0],
          entries: [{ balance: `1`, completion_time: `Thu, 01 Jan 1970 00:00:42 GMT` }]
        }
      ])
    })
  })

  // TODO: this still uses the condensed POST endpoint, which is incorrect
  it(`submits delegation transaction`, async () => {
    const stakingTransactions = {}
    stakingTransactions.delegations = [
      {
        validator: lcdClientMock.state.candidates[0],
        atoms: 109
      },
      {
        validator: lcdClientMock.state.candidates[1],
        atoms: 456
      }
    ]
    const dispatch = jest.fn()

    await actions.submitDelegation(
      {
        rootState: mockRootState,
        getters: {
          liquidAtoms: 1000
        },
        state,
        dispatch,
        commit: jest.fn()
      },
      { stakingTransactions }
    )

    expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`submits undelegation transaction`, async () => {
    const stakingTransactions = {}
    stakingTransactions.delegations = [
      {
        validator: lcdClientMock.state.candidates[0],
        atoms: -113
      },
      {
        validator: lcdClientMock.state.candidates[1],
        atoms: -356
      }
    ]
    const dispatch = jest.fn()

    await actions.submitDelegation(
      {
        rootState: mockRootState,
        getters: {
          liquidAtoms: 1000
        },
        state,
        dispatch,
        commit: () => { }
      },
      { stakingTransactions }
    )

    expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
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
      getDelegations: jest.fn(
        () => new Promise(resolve => setTimeout(() => resolve([]), 10000))
      ),
      getUndelegations: jest.fn(() => []),
      getRedelegations: jest.fn(() => [])
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
      lcdClientMock.state.candidates
    )

    rootState.session.address = `other_address`

    jest.runAllTimers()

    expect(commit).not.toHaveBeenCalled()
  })

  it(`should store a undelegation`, async () => {
    mutations.setUnbondingDelegations(state, [
      {
        validator_address: lcdClientMock.validators[0],
        entries: [{
          balance: `100`,
          creation_height: `12`,
          completion_time: new Date().toUTCString()
        }],
      }
    ])

    expect(state.unbondingDelegations[lcdClientMock.validators[0]]).toEqual([{
      balance: `100`,
      creation_height: `12`,
      completion_time: new Date().toUTCString()
    }])
  })

  it(`should update the atoms on a delegation optimistically`, async () => {
    const commit = jest.fn()
    const delegates = lcdClientMock.state.candidates
    const stakingTransactions = {}
    stakingTransactions.delegations = [
      {
        validator: delegates[0],
        atoms: 109
      },
      {
        validator: delegates[1],
        atoms: 456
      }
    ]
    const committedDelegates = {
      [delegates[0].operator_address]: 10
    }

    await actions.submitDelegation(
      {
        rootState: mockRootState,
        state: {
          committedDelegates
        },
        getters: {
          liquidAtoms: 1000
        },
        dispatch: () => { },
        commit
      },
      {
        amount: 100,
        validator_address: delegates[0].operator_address,
        password: `12345`
      }
    )
    expect(commit).toHaveBeenCalledWith(`updateWalletBalance`, {
      denom: `STAKE`,
      amount: 900
    })
    expect(commit).toHaveBeenCalledWith(`setCommittedDelegation`, {
      candidateId: delegates[0].operator_address,
      value: 110
    })
  })

  it(`should update delegates after delegation`, async () => {
    jest.useFakeTimers()
    const stakingTransactions = {}
    stakingTransactions.unbondings = [
      {
        validator: {
          operator_address: lcdClientMock.validators[0],
          delegator_shares: `100`,
          tokens: `100`
        },
        balance: {
          amount: `100`
        }
      }
    ]

    const dispatch = jest.fn()
    await actions.submitDelegation(
      {
        rootState: mockRootState,
        getters: {
          liquidAtoms: 1000
        },
        state,
        dispatch,
        commit: jest.fn()
      },
      { stakingTransactions }
    )
    jest.runAllTimers()
    expect(dispatch).toHaveBeenCalledWith(`updateDelegates`)
    expect(dispatch).toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should store an error if failed to load delegations`, async () => {
    const node = lcdClientMock
    const { state, actions } = delegationModule({ node })
    jest
      .spyOn(node, `getDelegations`)
      .mockImplementationOnce(async () => Promise.reject(`Error`))
    await actions.getBondedDelegates({
      state,
      rootState: mockRootState,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should store an error if failed to load undelegations`, async () => {
    const node = lcdClientMock
    const { state, actions } = delegationModule({ node })
    jest
      .spyOn(node, `getUndelegations`)
      .mockImplementationOnce(async () => Promise.reject(`Error`))
    await actions.getBondedDelegates({
      state,
      rootState: mockRootState,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should store an error if failed to load redelegations`, async () => {
    const node = lcdClientMock
    const { state, actions } = delegationModule({ node })
    jest
      .spyOn(node, `getRedelegations`)
      .mockImplementationOnce(async () => Promise.reject(`Error`))
    await actions.getBondedDelegates({
      state,
      rootState: mockRootState,
      commit: jest.fn(),
      dispatch: jest.fn()
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should load delegates and delegations if signed in`, async () => {
    const node = lcdClientMock
    const { actions } = delegationModule({ node })

    const dispatch = jest.fn(() => [])

    await actions.updateDelegates({
      dispatch, rootState: {
        session: {
          signedIn: true
        }
      }
    })

    expect(dispatch).toHaveBeenCalledWith(`getDelegates`)
    expect(dispatch).toHaveBeenCalledWith(`getBondedDelegates`, [])
  })
})
