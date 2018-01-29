import setup from '../../helpers/vuex-setup'

let axios = require('axios')

let instance = setup()

describe('Module: Delegates', () => {
  let store, node

  beforeEach(() => {
    let test = instance.shallow()
    store = test.store
    node = test.node
  })

  it('adds delegate to state', () => {
    store.commit('addDelegate', { pub_key: { data: 'foo' } })
    expect(store.state.delegates[0]).toEqual({
      id: 'foo',
      pub_key: { data: 'foo' }
    })
    expect(store.state.delegates.length).toBe(1)
  })

  it('replaces existing delegate with same id', () => {
    store.commit('addDelegate', { pub_key: { data: 'foo' }, updated: true })
    expect(store.state.delegates[0]).toEqual({
      id: 'foo',
      pub_key: { data: 'foo' },
      updated: true
    })
    expect(store.state.delegates.length).toBe(1)
  })

  it('fetches a candidate', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: {
          data: {
            pub_key: { data: 'foo' },
            test: 123
          }
        }
      }))

    await store.dispatch('getDelegate', { data: 'foo' })
    expect(axios.get.mock.calls[0][0]).toBe('http://localhost:9060/query/stake/candidate/foo')
    expect(store.state.delegates[0].test).toBe(123)
  })

  it('fetches all candidates', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: {
          data: {
            pub_key: { data: 'foo' },
            test: 123
          }
        }
      }))
      .mockReturnValueOnce(Promise.resolve({
        data: {
          data: {
            pub_key: { data: 'bar' },
            test: 456
          }
        }
      }))

    node.candidates = jest.fn()
      .mockReturnValueOnce({
        data: [
          { data: 'foo' },
          { data: 'bar' }
        ]
      })

    await store.dispatch('getDelegates')
    expect(axios.get.mock.calls[0][0]).toBe('http://localhost:9060/query/stake/candidate/foo')
    expect(axios.get.mock.calls[1][0]).toBe('http://localhost:9060/query/stake/candidate/bar')
    expect(store.state.delegates[0].test).toBe(123)
    expect(store.state.delegates[1].test).toBe(456)
  })
})
