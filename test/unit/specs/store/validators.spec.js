import Vuex from 'vuex'
import { createLocalVue } from 'vue-test-utils'
import mockValidators from './json/validators.json'
const mockValidatorHash = '1234567890123456789012345678901234567890'
const mockValidatorHashTwo = '0123456789012345678901234567890123456789'
const mockValidatorHeader = {
  height: 1337,
  chain_id: 'hash-browns',
  validators_hash: mockValidatorHash
}
const mockValidatorHeaderTwo = {
  height: 31337,
  chain_id: 'hash-browns',
  validators_hash: mockValidatorHashTwo
}

const Validators = require('renderer/vuex/modules/validators').default

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Module: Validators', () => {
  let node, store, wrapper
  let setValidators, setValidatorHash, maybeUpdateValidators

  beforeEach(() => {
    node = require('../../helpers/node_mock')
    store = new Vuex.Store({
      modules: {
        validators: Validators({node})
      }
    })
  })


  it('should have no validators by default', () => {
    expect(store.state.validators.validators).toEqual({})
  })

  it('should have a null validator hash by default', () => {
    expect(store.state.validators.validatorHash).toEqual(null)
  })
  
  it('should set validators', () => {
    store.commit('setValidators',  mockValidators)
    expect(store.state.validators.validators.length).toBe(6)
  })

  it('should set validator hash', () => {
    store.commit('setValidatorHash', mockValidatorHash)
    expect(store.state.validators.validatorHash).toBe(mockValidatorHash)
  })

  it('should update validators if the hash is different', () => {
    store.dispatch('maybeUpdateValidators', mockValidatorHeaderTwo)
    expect(store.state.validators.validatorHash).toBe(mockValidatorHashTwo)
  })

})
