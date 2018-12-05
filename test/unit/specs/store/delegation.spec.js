import setup from "../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import delegationModule from "renderer/vuex/modules/delegation.js"

let instance = setup()

let mockRootState = {
  wallet: {
    address: `x`
  },
  connection: {
    connected: true
  },
  config: {
    bondingDenom: `atom`
  },
  user: {
    atoms: 1000
  }
}

describe(`Module: Delegations`, () => {
  let store, node

  beforeEach(async () => {
    let test = instance.shallow()
    store = test.store
    node = test.node

    await store.dispatch(`signIn`, { password: `bar`, account: `default` })
    await store.commit(`setConnected`, true)
    await store.dispatch(`getDelegates`)
  })

  it(`adds delegate to cart`, () => {
    store.commit(`addToCart`, { id: `foo`, x: 1 })
    expect(store.state.delegation.delegates[0]).toEqual({
      id: `foo`,
      delegate: { id: `foo`, x: 1 },
      atoms: 0
    })
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it(`does not add delegate to cart if already exists`, () => {
    store.commit(`addToCart`, { id: `foo` })
    store.commit(`addToCart`, { id: `foo`, x: 1 })
    expect(store.state.delegation.delegates[0].id).toBe(`foo`)
    expect(store.state.delegation.delegates[0].x).toBe(undefined)
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it(`removes delegate from cart`, () => {
    store.commit(`addToCart`, { id: `foo` })
    store.commit(`addToCart`, { id: `bar` })
    store.commit(`removeFromCart`, `foo`)
    expect(store.state.delegation.delegates[0]).toEqual({
      id: `bar`,
      delegate: { id: `bar` },
      atoms: 0
    })
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it(`sets committed atoms for delegate`, () => {
    store.commit(`addToCart`, { id: `foo` })
    store.commit(`setCommittedDelegation`, { candidateId: `foo`, value: 123 })
    expect(store.state.delegation.committedDelegates).toEqual({ foo: 123 })
  })

  it(`sets committed atoms for delegate to 0`, () => {
    store.commit(`addToCart`, { id: `foo` })
    store.commit(`setCommittedDelegation`, { candidateId: `foo`, value: 123 })
    store.commit(`setCommittedDelegation`, { candidateId: `foo`, value: 0 })
    expect(store.state.delegation.committedDelegates).toEqual({})
  })

  it(`fetches bonded delegates`, async () => {
    await store.dispatch(`getBondedDelegates`, store.state.delegates.delegates)
    expect(store.state.delegation.committedDelegates).toMatchSnapshot()
  })

  it(`submits delegation transaction`, async () => {
    store.dispatch(`setLastHeader`, {
      height: 42,
      chain_id: `test-chain`
    })
    await store.dispatch(`getBondedDelegates`)

    jest.spyOn(store._actions.sendTx, `0`)

    const delegates = store.state.delegates.delegates

    let stakingTransactions = {}
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

    await store.dispatch(`submitDelegation`, { stakingTransactions })

    expect(store._actions.sendTx[0].mock.calls).toMatchSnapshot()
  })

  it(`submits undelegation transaction`, async () => {
    store.dispatch(`setLastHeader`, {
      height: 42,
      chain_id: `test-chain`
    })
    await store.dispatch(`getBondedDelegates`)

    jest.spyOn(store._actions.sendTx, `0`)

    const delegates = store.state.delegates.delegates
    let stakingTransactions = {}
    stakingTransactions.unbondings = [
      {
        validator: delegates[0],
        atoms: -113
      },
      {
        validator: delegates[1],
        atoms: -356
      }
    ]

    await store.dispatch(`submitDelegation`, { stakingTransactions })
    expect(store._actions.sendTx[0].mock.calls).toMatchSnapshot()
  })

  it(`fetches current undelegations`, async () => {
    await store.dispatch(`getBondedDelegates`, store.state.delegates.delegates)
    expect(store.state.delegation.unbondingDelegations).toMatchSnapshot()
  })

  it(`deletes undelegations that are 0`, async () => {
    await store.dispatch(`getBondedDelegates`, store.state.delegates.delegates)
    store.commit(`setUnbondingDelegations`, {
      validator_addr: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
      balance: { amount: 0 }
    })
    expect(
      store.state.delegation.unbondingDelegations
        .cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw
    ).toBeUndefined()
  })

  it(`should query delegated atoms on reconnection`, () => {
    jest.resetModules()
    let axios = require(`axios`)
    store.state.connection.stopConnecting = true
    store.state.delegation.loading = true
    jest.spyOn(axios, `get`)
    store.dispatch(`reconnected`)
    expect(axios.get.mock.calls).toMatchSnapshot()
  })

  it(`should not query delegated atoms on reconnection if not stuck in loading`, () => {
    jest.resetModules()
    let axios = require(`axios`)
    store.state.connection.stopConnecting = true
    store.state.delegation.loading = false
    jest.spyOn(axios, `get`)
    store.dispatch(`reconnected`)
    expect(axios.get.mock.calls.length).toBe(0)
  })

  it(`updating delegations should not update another users state after signing out and in again`, async () => {
    jest.resetModules()
    let resolveDelegationRequest

    // mock returning some delegations
    node.getDelegations = () =>
      new Promise(resolve => {
        resolveDelegationRequest = () =>
          resolve({
            delegations: [
              {
                delegator_addr: `abc`,
                validator_addr: `def`,
                shares: `14`,
                height: 123
              }
            ]
          })
      })

    // trigger the get call
    let getDelegationsPromise = store.dispatch(
      `getBondedDelegates`,
      store.state.delegates.delegates
    )

    // sign out - sign in
    store.state.user.address = `some other address`

    // finish the request
    resolveDelegationRequest()
    await getDelegationsPromise

    // expect the delegations to not be updated, as the address changed
    expect(Object.keys(store.state.delegation.committedDelegates)).toHaveLength(
      0
    )
  })

  it(`should undelegate`, async () => {
    // store the unbondingDelegation in the lcdclientmock
    let stakingTransactions = {}
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
    await store.dispatch(`submitDelegation`, { stakingTransactions })

    store.commit(`setUnbondingDelegations`, {
      validator_addr: lcdClientMock.validators[0],
      balance: { amount: `100` }
    })
    expect(
      store.state.delegation.unbondingDelegations[lcdClientMock.validators[0]]
    ).toBeTruthy()
  })

  it(`should remove dead delegations and undelegations`, async () => {
    store.commit(`setCommittedDelegation`, {
      candidateId: lcdClientMock.validators[1],
      value: 1
    })
    store.commit(`setUnbondingDelegations`, {
      validator_addr: lcdClientMock.validators[1],
      balance: {
        amount: 1
      }
    })
    expect(
      store.state.delegation.committedDelegates[lcdClientMock.validators[1]]
    ).toBeTruthy()
    expect(
      store.state.delegation.unbondingDelegations[lcdClientMock.validators[1]]
    ).toBeTruthy()
    await store.dispatch(`getBondedDelegates`) // lcdclientmock doesn't have the delegations we set above so they should be deleted locally

    expect(
      store.state.delegation.committedDelegates[lcdClientMock.validators[1]]
    ).toBeFalsy()
    expect(
      store.state.delegation.unbondingDelegations[lcdClientMock.validators[1]]
    ).toBeFalsy()
  })

  it(`should update delegation status`, async () => {
    store.state.delegation.committedDelegates = {}
    await store.dispatch(`updateDelegates`)
    expect(store.state.delegation.committedDelegates).toBeTruthy()
  })

  it(`should update the atoms on a delegation optimistically`, async () => {
    const commit = jest.fn()
    const delegates = store.state.delegates.delegates
    let stakingTransactions = {}
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
    let committedDelegates = {
      [delegates[0].operator_address]: 10,
      [delegates[1].operator_address]: 50
    }

    await delegationModule({}).actions.submitDelegation(
      {
        rootState: {
          config: {
            bondingDenom: `atom`
          },
          user: {
            atoms: 1000
          },
          wallet: {}
        },
        state: {
          committedDelegates
        },
        dispatch: () => {},
        commit
      },
      { stakingTransactions }
    )

    expect(commit).toHaveBeenCalledWith(`setAtoms`, 435)
    expect(committedDelegates).toEqual({
      [delegates[0].operator_address]: 119,
      [delegates[1].operator_address]: 506
    })
  })

  it(`should update updateDelegates after delegation`, async () => {
    jest.useFakeTimers()
    let stakingTransactions = {}
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
    jest.spyOn(store._actions.updateDelegates, `0`)

    await store.dispatch(`submitDelegation`, { stakingTransactions })
    jest.runAllTimers()
    expect(store._actions.updateDelegates[0].mock.calls).toHaveLength(1)
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
})
