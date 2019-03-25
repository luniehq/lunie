import delegatesModule from "renderer/vuex/modules/delegates.js"
import nodeMock from "../../helpers/node_mock.js"
import BN from "bignumber.js"

const mockRootState = {
  connection: {
    connected: true
  }
}

describe(`Module: Delegates`, () => {
  let instance
  let node

  beforeEach(() => {
    node = Object.assign({}, nodeMock)
    instance = delegatesModule({ node })
  })

  it(`adds delegate to state`, () => {
    const { mutations, state } = instance
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
    const { mutations, state } = instance
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
    const { mutations, state } = instance
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
    const { actions, state } = instance
    const commit = jest.fn()
    const dispatch = jest.fn()
    const candidates = await actions.getDelegates({
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

  it(`keeps the loading state if loading failed`, async () => {
    const { actions, state } = instance
    const commit = jest.fn()
    const dispatch = jest.fn()
    node.getValidators = () => Promise.reject(new Error(`Expected`))
    await actions.getDelegates({
      state,
      commit,
      dispatch,
      rootState: mockRootState
    })
    expect(commit.mock.calls).toEqual([
      [`setDelegateLoading`, true],
      [
        `notifyError`,
        {
          body: `Expected`,
          title: `Error fetching validators`
        }
      ]
    ])
  })

  it(`should query further info for validators`, async () => {
    const { actions, state } = instance
    const commit = jest.fn()
    const dispatch = jest.fn()
    const candidates = await actions.getDelegates({
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
    const { actions, mutations, state } = instance
    const commit = jest.fn()
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
      { state, commit, getters: { lastHeader: { height: `43` } } },
      state.delegates
    )

    expect(state.delegates).toContainEqual(
      expect.objectContaining({ signing_info: expect.anything() })
    )
  })

  it(`throttles validator fetching to every 20 blocks`, async () => {
    node = Object.assign({}, nodeMock, {
      getValidatorSigningInfo: jest.fn()
    })
    instance = delegatesModule({ node })
    const { actions, state } = instance
    const commit = jest.fn()
    state.lastValidatorsUpdate = 0
    await actions.updateSigningInfo(
      {
        state, commit, getters: { lastHeader: { height: `43` } }
      },
      [
        {
          operator_address: `foo`,
          consensus_pubkey: `bar`,
          tokens: `10`
        }
      ]
    )
    expect(state.lastValidatorsUpdate).toBe(43)
    node.getValidatorSigningInfo.mockClear()
    await actions.updateSigningInfo(
      {
        state, commit, getters: { lastHeader: { height: `44` } }
      },
      [
        {
          operator_address: `foo`,
          consensus_pubkey: `bar`,
          tokens: `10`
        }
      ]
    )
    expect(node.getValidatorSigningInfo).not.toHaveBeenCalled()
  })

  it(`should query for delegates on reconnection if was loading before`, async () => {
    const { actions } = delegatesModule({})
    const instance = {
      state: {
        loading: true
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).toHaveBeenCalledWith(`getDelegates`)
  })

  it(`should not query for delegates on reconnection if not stuck in loading`, async () => {
    const { actions } = delegatesModule({})
    const instance = {
      state: {
        loading: false
      },
      dispatch: jest.fn()
    }
    await actions.reconnected(instance)
    expect(instance.dispatch).not.toHaveBeenCalledWith(`getDelegates`)
  })

  it(`should query self bond of a validator`, async () => {
    const { actions } = instance
    const commit = jest.fn()
    const validator = {
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
    const { actions } = instance
    const commit = jest.fn()
    const validator = {
      operator_address: nodeMock.validators[0],
      delegator_shares: `120`,
      selfBond: BN(1)
    }
    node.getDelegation = jest.fn()

    await actions.getSelfBond({ commit }, validator)
    expect(node.getDelegation).not.toHaveBeenCalled()
  })

  it(`should set self bond of a validator`, async () => {
    const { state, mutations } = instance
    const validator = {
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
    const { actions, state } = instance
    node.getValidators = async () => Promise.reject(`Error`)
    await actions.getDelegates({
      commit: jest.fn(),
      dispatch: jest.fn(),
      state,
      rootState: mockRootState
    })
    expect(state.error).toBe(`Error`)
  })
})
