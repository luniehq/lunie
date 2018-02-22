let axios = require('axios')
let LcdClient = require('../../../app/src/renderer/lcdClient.js')

describe('LCD Client', () => {
  let client = new LcdClient()

  it('makes a GET request with no args', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: { foo: 'bar' }
      }))

    let res = await client.status()
    expect(res).toEqual({ foo: 'bar' })
    expect(axios.get.mock.calls[0]).toEqual([
      'http://localhost:8998/tendermint/status',
      undefined
    ])
  })

  it('makes a GET request with one arg', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: { foo: 'bar' }
      }))

    let res = await client.getKey('myKey')
    expect(res).toEqual({ foo: 'bar' })
    expect(axios.get.mock.calls[0]).toEqual([
      'http://localhost:8998/keys/myKey',
      undefined
    ])
  })

  it('makes a GET request with multiple args', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: { foo: 'bar' }
      }))

    let res = await client.bondingsByDelegator([ 'foo', 'bar' ])
    expect(res).toEqual({ foo: 'bar' })
    expect(axios.get.mock.calls[0]).toEqual([
      'http://localhost:8998/tx/bondings/delegator/foo/bar',
      undefined
    ])
  })

  it('makes a POST request', async () => {
    axios.post = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: { foo: 'bar' }
      }))

    let res = await client.generateKey()
    expect(res).toEqual({ foo: 'bar' })
    expect(axios.post.mock.calls[0]).toEqual([
      'http://localhost:8998/keys',
      undefined
    ])
  })

  it('makes a POST request with args and data', async () => {
    axios.put = jest.fn()
      .mockReturnValueOnce(Promise.resolve({
        data: { foo: 'bar' }
      }))

    let res = await client.updateKey('myKey', { abc: 123 })
    expect(res).toEqual({ foo: 'bar' })
    expect(axios.put.mock.calls[0]).toEqual([
      'http://localhost:8998/keys/myKey',
      { abc: 123 }
    ])
  })

  it('makes a GET request with an error', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.reject({
        response: {
          data: {
            error: 'foo',
            code: 123
          }
        }
      }))

    try {
      await client.status()
    } catch (err) {
      expect(err.message).toBe('foo')
      expect(err.code).toBe(123)
    }
    expect(axios.get.mock.calls[0]).toEqual([
      'http://localhost:8998/tendermint/status',
      undefined
    ])
  })

  it('does not throw error for empty results', async () => {
    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.reject({
        response: {
          data: {
            error: 'account bytes are empty',
            code: 1
          }
        }
      }))
    let res = await client.queryAccount('address')
    expect(res).toBe(null)

    axios.get = jest.fn()
      .mockReturnValueOnce(Promise.reject({
        response: {
          data: {
            error: 'nonce empty',
            code: 2
          }
        }
      }))
    res = await client.queryNonce('address')
    expect(res).toBe(0)
  })
})
