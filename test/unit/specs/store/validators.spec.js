import setup from "../../helpers/vuex-setup"
import validatorsModule from "renderer/vuex/modules/validators.js"
import nodeMock from "../../helpers/node_mock.js"
import BN from "bignumber.js"

let instance = setup()

import mockValidators from "./json/validators.json"
const mockValidatorHash = `1234567890123456789012345678901234567890`
const mockValidatorHashTwo = `0123456789012345678901234567890123456789`
const mockValidatorHeader = {
  height: 31312,
  chain_id: `hash-browns`,
  validators_hash: mockValidatorHash
}
const mockValidatorHeaderTwo = {
  height: 31337,
  chain_id: `hash-browns`,
  validators_hash: mockValidatorHashTwo
}

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Validators`, () => {
  let node, store

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node

    store.commit(`setConnected`, true)
  })

  it(`should have no validators by default`, () => {
    expect(store.state.validators.validators).toEqual([])
  })

  it(`should have a null validator hash by default`, () => {
    expect(store.state.validators.validatorHash).toEqual(null)
  })

  it(`should query validators`, async () => {
    await store.dispatch(`getValidators`)
    expect(store.state.validators.validators).toHaveLength(3)
  })

  it(`should survive errors in querying validators`, async () => {
    node.rpc.validators = cb => cb({ message: `Expected Error` }, undefined)
    store.dispatch(`getValidators`)
    expect(store.state.validators.validators).toHaveLength(0)
  })

  it(`should set validators`, () => {
    store.commit(`setValidators`, mockValidators)
    expect(store.state.validators.validatorHash).toEqual(null)
  })

  it(`should set validator hash`, () => {
    store.commit(`setValidatorHash`, mockValidatorHash)
    expect(store.state.validators.validatorHash).toBe(mockValidatorHash)
  })

  it(`should update validators if the hash is different`, () => {
    store.dispatch(`maybeUpdateValidators`, mockValidatorHeaderTwo)
    expect(store.state.validators.validatorHash).toBe(mockValidatorHashTwo)
  })

  it(`should not update validators if the hash is not different`, () => {
    store.commit(`setValidatorHash`, mockValidatorHash)
    store.dispatch(`maybeUpdateValidators`, mockValidatorHeader)
    expect(store.getDispatches(`getValidators`)).toHaveLength(0)
  })

  it(`should query the validators on reconnection`, () => {
    jest.resetModules()
    store.state.connection.stopConnecting = true
    store.state.validators.loading = true
    jest.spyOn(node, `getValidatorSet`)
    store.dispatch(`reconnected`)
    expect(node.getValidatorSet).toHaveBeenCalled()
  })

  it(`should not query validators on reconnection if not stuck in loading`, () => {
    jest.resetModules()
    store.state.connection.stopConnecting = true
    store.state.validators.loading = false
    jest.spyOn(node.rpc, `validators`)
    store.dispatch(`reconnected`)
    expect(node.rpc.validators).not.toHaveBeenCalled()
  })

  it(`should store an error if failed to load validators`, async () => {
    let { actions, state } = validatorsModule({
      node: {
        getValidatorSet: () => Promise.reject(new Error(`reason`))
      }
    })
    const commit = jest.fn()
    const rootState = {
      connection: {
        connected: true
      }
    }
    await actions.getValidators({ state, commit, rootState })
    expect(state.error.message).toBe(`reason`)
    expect(commit).toHaveBeenCalledWith(`notifyError`, {
      title: `Error fetching validator set`,
      body: expect.stringContaining(`reason`)
    })
  })

  it(`adds delegate to state`, () => {
    let { mutations, state } = module
    mutations.setValidators(state, [
      {
        operator_address: `foo`,
        percent_of_vote: `100.00%`,
        tokens: `10`
      }
    ])
    expect(state.delegates).toEqual([
      {
        id: `foo`,
        operator_address: `foo`,
        percent_of_vote: `100.00%`,
        tokens: `10`,
        voting_power: BN(10)
      }
    ])
  })

  it(`replaces existing delegate with same id`, () => {
    let { mutations, state } = module
    mutations.setValidators(state, [
      {
        operator_address: `foo`,
        tokens: `12`,
        updated: true
      }
    ])
    expect(state.delegates).toEqual([
      {
        id: `foo`,
        operator_address: `foo`,
        percent_of_vote: `100.00%`,
        tokens: `12`,
        updated: true,
        voting_power: BN(12)
      }
    ])
  })

  it(`parses delegate tokens with fraction value`, () => {
    let { mutations, state } = module
    mutations.setValidators(state, [
      {
        operator_address: `foo`,
        tokens: `4000/40`,
        updated: true
      }
    ])
    expect(state.delegates).toEqual([
      {
        id: `foo`,
        operator_address: `foo`,
        percent_of_vote: `100.00%`,
        tokens: `4000/40`,
        updated: true,
        voting_power: BN(100)
      }
    ])
  })

  it(`fetches all validators`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    let dispatch = jest.fn()
    let validators = await actions.getValidators({
      state,
      commit,
      dispatch,
      rootState: mockRootState
    })
    expect(commit.mock.calls).toEqual([
      [`setValidatorLoading`, true],
      [`setValidators`, validators],
      [`setValidatorLoading`, false]
    ])
  })

  it(`should query further info for validators`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    let dispatch = jest.fn()
    let validators = await actions.getValidators({
      state,
      commit,
      dispatch,
      rootState: mockRootState
    })
    expect(dispatch.mock.calls).toEqual([
      [`getKeybaseIdentities`, validators],
      [`updateSigningInfo`, validators]
    ])
  })

  it(`fetches the signing information from all delegates`, async () => {
    let { actions, mutations, state } = module
    let commit = jest.fn()
    let dispatch = jest.fn()
    mutations.setValidators(state, [
      {
        operator_address: `foo`,
        consensus_pubkey: `bar`,
        tokens: `10`
      }
    ])
    expect(state.delegates).not.toContainEqual(
      expect.objectContaining({ signing_info: expect.anything() })
    )
    await actions.updateSigningInfo(
      { state, commit, dispatch },
      state.delegates
    )

    expect(state.delegates).toContainEqual(
      expect.objectContaining({ signing_info: expect.anything() })
    )
  })

  it(`should query for delegates on reconnection if was loading before`, async () => {
    let { actions } = delegatesModule({})
    let instance = {
      state: {
        loading: true
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).toHaveBeenCalledWith(`getValidators`)
  })

  it(`should not query for delegates on reconnection if not stuck in loading`, async () => {
    let { actions } = delegatesModule({})
    let instance = {
      state: {
        loading: false
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).not.toHaveBeenCalledWith(`getValidators`)
  })

  it(`should query self bond of a validator`, async () => {
    let { actions } = module
    let commit = jest.fn()
    let validator = {
      operator_address: nodeMock.validators[0],
      delegator_shares: `120`
    }
    node.getDelegation = jest.fn(() => ({ shares: `12` }))

    await actions.getSelfBond({ commit }, validator)
    expect(commit).toHaveBeenCalledWith(`setSelfBond`, {
      validator,
      ratio: BN(0.1)
    })
  })

  it(`should not query self bond of a validator if already queried`, async () => {
    let { actions } = module
    let commit = jest.fn()
    let validator = {
      operator_address: nodeMock.validators[0],
      delegator_shares: `120`,
      selfBond: BN(1)
    }
    node.getDelegation = jest.fn()

    await actions.getSelfBond({ commit }, validator)
    expect(node.getDelegation).not.toHaveBeenCalled()
  })

  it(`should set self bond of a validator`, async () => {
    let { state, mutations } = module
    let validator = {
      operator_address: nodeMock.validators[0],
      delegator_shares: `120`
    }
    state.delegates = [validator]

    await mutations.setSelfBond(state, {
      validator,
      ratio: BN(0.1)
    })
    expect(
      state.delegates.find(
        ({ operator_address }) => operator_address === nodeMock.validators[0]
      )
    ).toHaveProperty(`selfBond`, BN(0.1))
  })

  it(`should store an error if failed to load delegates`, async () => {
    let { actions, state } = module
    node.getValidators = async () => Promise.reject(`Error`)
    await actions.getValidators({
      commit: jest.fn(),
      dispatch: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should store an error if failed to load validator set`, async () => {
    let { actions, state } = module
    node.getValidatorSet = async () => Promise.reject(`Error`)
    await actions.getValidators({
      commit: jest.fn(),
      dispatch: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error).toBe(`Error`)
  })
})
