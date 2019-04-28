import setup from "../../helpers/vuex-setup"
import validatorsModule from "src/vuex/modules/validators.js"

const instance = setup()

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
const coinArray = [
  { denom: `stake`, amount: `100` },
  { denom: `photino`, amount: `15` }
]

const rewards = {
  stake: 100,
  photino: 15
}

describe(`Module: Validators`, () => {
  let node, store

  beforeEach(() => {
    const test = instance.shallow(null)
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

  it(`should set validator's distribution info`, () => {
    const validatorAddr = `cosmosvaloper1address`
    const info = { rewards, self_bond_rewards: `0.0001`, val_commission: `0.0005` }
    store.commit(`setValidatorDistributionInfo`, { validatorAddr, info })
    expect(store.state.validators.distributionInfo[validatorAddr])
      .toMatchObject(info)
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

  it(`should not query the validators on reconnection if not connected`, async () => {
    const validators = [1, 2, 3]
    const node = {
      getValidatorSet: () => Promise.resolve({ validators })
    }
    const { actions } = validatorsModule({
      node
    })
    const commit = jest.fn()
    await actions.getValidators({
      state: {},
      commit,
      rootState: { connection: { connected: false } }
    })
    expect(commit.mock.calls).toEqual([])
  })

  it(`should query the validators when connected`, async () => {
    const validators = [1, 2, 3]
    const node = {
      getValidatorSet: () => Promise.resolve({ validators })
    }
    const { actions } = validatorsModule({
      node
    })
    const commit = jest.fn()
    await actions.getValidators({
      state: {},
      commit,
      rootState: { connection: { connected: true } }
    })
    expect(commit).toHaveBeenCalledWith(`setValidators`, validators)
  })

  it(`should handle errors with call getValidatorSet`, async () => {
    const error = `nada`
    const node = {
      getValidatorSet: () => Promise.reject(new Error(error))
    }
    const { actions } = validatorsModule({
      node
    })
    const commit = jest.fn()
    await actions.getValidators({
      state: {},
      commit,
      rootState: { connection: { connected: true } }
    })
    expect(commit).toHaveBeenCalledWith(`notifyError`, {
      body: error,
      title: `Error fetching validator set`
    })
  })

  it(`should not query validators on reconnection if not stuck in loading`, () => {
    const node = {}
    const { actions } = validatorsModule({
      node
    })
    const dispatch = jest.fn()
    actions.reconnected({
      state: { loading: false },
      dispatch
    })
    expect(dispatch.mock.calls).toEqual([])
    actions.reconnected({
      state: { loading: true },
      dispatch
    })
    expect(dispatch.mock.calls).toEqual([[`getValidators`]])
  })

  it(`should store an error if failed to load validators`, async () => {
    const { actions, state } = validatorsModule({
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

  describe(`getValidatorDistributionInfo`, () => {
    let module, state, commit, actions, rootState
    const info = { self_bond_rewards: coinArray, val_commission: coinArray }

    beforeEach(() => {
      node = {
        getValidatorDistributionInformation: jest.fn(async () => info),
      }
      module = validatorsModule({ node })
      state = module.state
      actions = module.actions

      commit = jest.fn()
    })

    it(`success`, async () => {
      const validatorAddr = `cosmosvaloper1address`
      await actions.getValidatorDistributionInfo(
        { state, rootState, commit },
        validatorAddr
      )
      expect(node.getValidatorDistributionInformation)
        .toHaveBeenCalledWith(validatorAddr)
      expect(commit).toHaveBeenCalledWith(`setValidatorDistributionInfo`, {
        validatorAddr, info: {
          self_bond_rewards: rewards,
          val_commission: rewards
        }
      })
    })

    it(`fails`, async () => {
      const validatorAddr = null
      node.getValidatorDistributionInformation =
        jest.fn(async () => Promise.reject(
          Error(`invalid validator address`))
        )
      await actions.getValidatorDistributionInfo(
        { state, rootState, commit },
        validatorAddr
      )
      expect(node.getValidatorDistributionInformation)
        .toHaveBeenCalledWith(validatorAddr)
      expect(commit).not.toHaveBeenCalledWith(`setValidatorDistributionInfo`, {
        validatorAddr, info: {
          self_bond_rewards: rewards,
          val_commission: rewards
        }
      })
      expect(state.error).toEqual(Error(`invalid validator address`))
    })
  })

  describe(`getValidatorRewards`, () => {
    let module, state, commit, actions, rootState

    beforeEach(() => {
      node = {
        getValidatorRewards: jest.fn(async () => coinArray)
      }
      module = validatorsModule({ node })
      state = module.state
      actions = module.actions

      commit = jest.fn()
    })

    it(`success`, async () => {
      const validatorAddr = `cosmosvaloper1address`
      await actions.getValidatorDistributionRewards(
        { state, rootState, commit },
        validatorAddr
      )
      expect(node.getValidatorRewards).toHaveBeenCalledWith(validatorAddr)
      expect(commit).toHaveBeenCalledWith(`setValidatorRewards`, {
        validatorAddr, rewards
      })
    })

    it(`fails`, async () => {
      const validatorAddr = null
      node.getValidatorRewards = jest.fn(async () => Promise.reject(Error(`invalid validator address`)))
      await actions.getValidatorDistributionRewards(
        { state, rootState, commit },
        validatorAddr
      )
      expect(node.getValidatorRewards).toHaveBeenCalledWith(validatorAddr)
      expect(commit).not.toHaveBeenCalledWith(`setValidatorRewards`, { validatorAddr, rewards })
      expect(state.error).toEqual(Error(`invalid validator address`))
    })
  })

})
