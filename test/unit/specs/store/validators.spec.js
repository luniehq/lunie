import setup from "../../helpers/vuex-setup"
import validatorsModule from "renderer/vuex/modules/validators.js"

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
})
