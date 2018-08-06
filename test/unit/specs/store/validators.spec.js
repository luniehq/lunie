import setup from "../../helpers/vuex-setup"

let instance = setup()

import mockValidators from "./json/validators.json"
const mockValidatorHash = "1234567890123456789012345678901234567890"
const mockValidatorHashTwo = "0123456789012345678901234567890123456789"
const mockValidatorHeader = {
  height: 31312,
  chain_id: "hash-browns",
  validators_hash: mockValidatorHash
}
const mockValidatorHeaderTwo = {
  height: 31337,
  chain_id: "hash-browns",
  validators_hash: mockValidatorHashTwo
}

describe("Module: Validators", () => {
  let node, store

  beforeEach(() => {
    let test = instance.shallow(null)
    store = test.store
    node = test.node
  })

  it("should have no validators by default", () => {
    expect(store.state.validators.validators).toEqual([])
  })

  it("should have a null validator hash by default", () => {
    expect(store.state.validators.validatorHash).toEqual(null)
  })

  it("should query validators", async () => {
    store.dispatch("getValidators")
    expect(store.state.validators.validators).toHaveLength(6)
  })

  it("should survive errors in querying validators", async () => {
    node.rpc.validators = cb => cb({ message: "Expected Error" }, undefined)
    store.dispatch("getValidators")
    expect(store.state.validators.validators).toHaveLength(0)
  })

  it("should set validators", () => {
    store.commit("setValidators", mockValidators)
    expect(store.state.validators.validatorHash).toEqual(null)
  })

  it("should set validator hash", () => {
    store.commit("setValidatorHash", mockValidatorHash)
    expect(store.state.validators.validatorHash).toBe(mockValidatorHash)
  })

  it("should update validators if the hash is different", () => {
    store.dispatch("maybeUpdateValidators", mockValidatorHeaderTwo)
    expect(store.state.validators.validatorHash).toBe(mockValidatorHashTwo)
  })

  it("should not update validators if the hash is not different", () => {
    store.commit("setValidatorHash", mockValidatorHash)
    store.dispatch("maybeUpdateValidators", mockValidatorHeader)
    expect(store.getDispatches("getValidators")).toHaveLength(0)
  })

  it("should query the validators on reconnection", () => {
    jest.resetModules()
    store.state.node.stopConnecting = true
    store.state.validators.loading = true
    jest.spyOn(node.rpc, "validators")
    store.dispatch("reconnected")
    expect(node.rpc.validators).toHaveBeenCalled()
  })

  it("should not query validators on reconnection if not stuck in loading", () => {
    jest.resetModules()
    store.state.node.stopConnecting = true
    store.state.validators.loading = false
    jest.spyOn(node.rpc, "validators")
    store.dispatch("reconnected")
    expect(node.rpc.validators).not.toHaveBeenCalled()
  })

  it("should not error when subscribing without previous subscription", async () => {
    store.state.wallet.subscribed = false
    store.dispatch("validatorUpdateSubscribe")
  })

  it("should handle ignore already subscribed errors", () => {
    console.error = jest.fn()
    node.rpc.subscribe = (query, cb) => {
      cb({ message: "expected error", data: "already subscribed" })
    }
    store.dispatch("validatorUpdateSubscribe")
    expect(console.error.mock.calls.length).toBe(1)
    expect(store.dispatch).not.toHaveBeenCalledWith("nodeHasHalted")
  })
})
