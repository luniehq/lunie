import Vuex from 'vuex'
import { createLocalVue } from 'vue-test-utils'

let axios = require('axios')
const Delegation = require('renderer/vuex/modules/delegation').default
const Send = require('renderer/vuex/modules/send').default

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Module: Delegations', () => {
  let store, node

  beforeEach(() => {
    node = require('../../helpers/node_mock')
    store = new Vuex.Store({
      modules: {
        delegation: Delegation({ node }),
        send: Send({ node }),
        wallet: {
          actions: {
            queryWalletBalances: () => Promise.resolve()
          },
          state: { key: { address: 'address' } }
        },
        user: {
          state: {
            account: 'foo',
            password: 'bar'
          }
        }
      }
    })
  })

  it('adds delegate to cart', () => {
    store.commit('addToCart', { id: 'foo', x: 1 })
    expect(store.state.delegation.delegates[0]).toEqual({
      id: 'foo',
      delegate: { id: 'foo', x: 1 },
      atoms: 0
    })
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it('does not add delegate to cart if already exists', () => {
    store.commit('addToCart', { id: 'foo' })
    store.commit('addToCart', { id: 'foo', x: 1 })
    expect(store.state.delegation.delegates[0].id).toBe('foo')
    expect(store.state.delegation.delegates[0].x).toBe(undefined)
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it('removes delegate from cart', () => {
    store.commit('addToCart', { id: 'foo' })
    store.commit('addToCart', { id: 'bar' })
    store.commit('removeFromCart', 'foo')
    expect(store.state.delegation.delegates[0]).toEqual({
      id: 'bar',
      delegate: { id: 'bar' },
      atoms: 0
    })
    expect(store.state.delegation.delegates.length).toBe(1)
  })

  it('sets atoms for delegate', () => {
    store.commit('addToCart', { id: 'foo' })
    store.commit('setShares', { candidateId: 'foo', value: 123 })
    expect(store.state.delegation.delegates[0].atoms).toBe(123)
  })

  it('sets committed atoms for delegate', () => {
    store.commit('addToCart', { id: 'foo' })
    store.commit('setCommittedDelegation', { candidateId: 'foo', value: 123 })
    expect(store.state.delegation.committedDelegates).toEqual({
      foo: 123
    })
  })

  it('sets committed atoms for delegate to 0', () => {
    store.commit('addToCart', { id: 'foo' })
    store.commit('setCommittedDelegation', { candidateId: 'foo', value: 123 })
    store.commit('setCommittedDelegation', { candidateId: 'foo', value: 0 })
    expect(store.state.delegation.committedDelegates).toEqual({})
  })

  it('fetches bonded delegates', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce({
        data: {
          data: {
            PubKey: { data: 'foo' },
            Shares: 123
          }
        }
      })
      .mockReturnValueOnce({
        data: {
          data: {
            PubKey: { data: 'bar' },
            Shares: 456
          }
        }
      })

    await store.dispatch('getBondedDelegates', {
      candidates: [
        { pub_key: { data: 'foo' } },
        { pub_key: { data: 'bar' } }
      ],
      address: '1234'
    })
    expect(axios.get.mock.calls[0][0]).toEqual('http://localhost:8998/query/stake/delegator/1234/foo')
    expect(axios.get.mock.calls[1][0]).toEqual('http://localhost:8998/query/stake/delegator/1234/bar')

    expect(store.state.delegation.committedDelegates).toEqual({
      foo: 123,
      bar: 456
    })
  })

  it('submits delegation transaction', async () => {
    store.commit('setCommittedDelegation', { candidateId: 'bar', value: 123 })
    store.commit('setCommittedDelegation', { candidateId: 'baz', value: 789 })
    jest.spyOn(store._actions.sendTx, '0')
    jest.spyOn(node, 'buildDelegate')
    jest.spyOn(node, 'buildUnbond')

    await store.dispatch('submitDelegation', {
      delegates: [
        {
          delegate: { pub_key: { data: 'foo' } },
          atoms: 123
        },
        {
          delegate: { pub_key: { data: 'bar' } },
          atoms: 456
        },
        {
          delegate: { pub_key: { data: 'baz' } },
          atoms: 0
        }
      ]
    })
    expect(store._actions.sendTx[0].mock.calls).toMatchSnapshot()
    expect(node.buildDelegate.mock.calls).toMatchSnapshot()
    expect(node.buildUnbond.mock.calls).toMatchSnapshot()
  })
})
