import delegatesModule from "renderer/vuex/modules/delegates.js"
import nodeMock from "../../helpers/node_mock.js"
import BN from "bignumber.js"

let mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Delegates`, () => {
  let module
  let node

  beforeEach(() => {
    node = Object.assign({}, nodeMock)
    module = delegatesModule({ node })
  })

  it(`adds delegate to state`, () => {
    let { mutations, state } = module
    mutations.setDelegates(state, [
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
    mutations.setDelegates(state, [
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
    mutations.setDelegates(state, [
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

  it(`fetches all candidates`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    let dispatch = jest.fn()
    let candidates = await actions.getDelegates({
      state,
      commit,
      dispatch,
      rootState: mockRootState
    })
    expect(commit.mock.calls).toEqual([
      [`setDelegateLoading`, true],
      [`setDelegates`, candidates],
      [`setDelegateLoading`, false]
    ])
  })

  it(`should query further info for validators`, async () => {
    let { actions, state } = module
    let commit = jest.fn()
    let dispatch = jest.fn()
    let candidates = await actions.getDelegates({
      state,
      commit,
      dispatch,
      rootState: mockRootState
    })
    expect(dispatch.mock.calls).toEqual([
      [`getKeybaseIdentities`, candidates],
      [`updateSigningInfo`, candidates]
    ])
  })

  it(`fetches the signing information from all delegates`, async () => {
    let { actions, mutations, state } = module
    let commit = jest.fn()
    let dispatch = jest.fn()
    mutations.setDelegates(state, [
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
    expect(instance.dispatch).toHaveBeenCalledWith(`getDelegates`)
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
    expect(instance.dispatch).not.toHaveBeenCalledWith(`getDelegates`)
  })

  it(`should query self bond of a validator`, async () => {
    let { actions } = module
    let commit = jest.fn()
    let validator = {
      operator_address: nodeMock.validators[0],
      delegator_shares: `120`
    }
    node.queryDelegation = jest.fn(() => ({ shares: `12` }))

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
    node.queryDelegation = jest.fn()

    await actions.getSelfBond({ commit }, validator)
    expect(node.queryDelegation).not.toHaveBeenCalled()
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
    node.getCandidates = async () => Promise.reject(`Error`)
    await actions.getDelegates({
      commit: jest.fn(),
      dispatch: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error).toBe(`Error`)
  })

  it(`should store an error if failed to load validator set`, async () => {
    let { actions, state } = module
    node.getValidatorSet = async () => Promise.reject(`Error`)
    await actions.getDelegates({
      commit: jest.fn(),
      dispatch: jest.fn(),
      rootState: mockRootState
    })
    expect(state.error).toBe(`Error`)
  })
})
