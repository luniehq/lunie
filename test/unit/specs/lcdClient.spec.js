let axios = require(`axios`)
let LcdClient = require(`renderer/connectors/lcdClient.js`)
let lcdClientMock = require(`renderer/connectors/lcdClientMock.js`)

describe(`LCD Client`, () => {
  const remoteLcdURL = `http://awesomenode.de:12345`
  const localLcdURL = `https://localhost:9876`
  let client = new LcdClient(localLcdURL, remoteLcdURL)

  it(`makes a GET request with no args`, async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

    let res = await client.listKeys()
    expect(res).toEqual({ foo: `bar` })
    expect(axios.get.mock.calls[0]).toEqual([`${localLcdURL}/keys`, undefined])
  })

  it(`makes a GET request with one arg`, async () => {
    axios.get = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

    let res = await client.getKey(`myKey`)
    expect(res).toEqual({ foo: `bar` })
    expect(axios.get.mock.calls[0]).toEqual([
      `${localLcdURL}/keys/myKey`,
      undefined
    ])
  })

  it(`makes a POST request`, async () => {
    axios.post = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

    let res = await client.storeKey()
    expect(res).toEqual({ foo: `bar` })
    expect(axios.post.mock.calls[0]).toEqual([`${localLcdURL}/keys`, undefined])
  })

  it(`makes a POST request with args and data`, async () => {
    axios.put = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

    let res = await client.updateKey(`myKey`, { abc: 123 })
    expect(res).toEqual({ foo: `bar` })
    expect(axios.put.mock.calls[0]).toEqual([
      `${localLcdURL}/keys/myKey`,
      { abc: 123 }
    ])
  })

  it(`makes a GET request with an error`, async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.reject({
        response: {
          data: `foo`
        }
      })
    )

    try {
      await await client.listKeys()
    } catch (err) {
      expect(err.message).toBe(`foo`)
    }
    expect(axios.get.mock.calls[0]).toEqual([`${localLcdURL}/keys`, undefined])
  })

  it(`delete requests have the correct format for data`, async () => {
    axios.delete = (path, config) => {
      expect(config).toEqual({ data: { password: `abc` } })
      return Promise.resolve({ data: { foo: `bar` } })
    }

    // doesn't throw
    await client.deleteKey(`test`, { password: `abc` })
  })

  it(`does not throw error for empty results`, async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.reject({
        response: {
          data: `account bytes are empty`
        }
      })
    )
    let res = await client.queryAccount(`address`)
    expect(res).toBe(null)
  })

  it(`queries for shares for a validator and delegate`, async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.resolve({
        response: {
          data: {
            shares: 5
          }
        }
      })
    )
    await client.queryDelegation(`abc`, `efg`)
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/stake/delegators/abc/delegations/efg`,
      undefined
    ])
  })

  it(`does not throw error for empty results`, async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.reject({
        response: {
          data: `account bytes are empty`
        }
      })
    )
    let res = await client.queryAccount(`address`)
    expect(res).toBe(null)
  })

  it(`throws error for error other than empty account`, async () => {
    axios.get = jest.fn().mockReturnValueOnce(
      Promise.reject({
        response: {
          data: `something failed`
        }
      })
    )
    try {
      await client.queryAccount(`address`)
    } catch (err) {
      expect(err.message).toBe(`something failed`)
    }
  })

  it(`checks for the connection with the lcd by performing a simple request`, async () => {
    client.listKeys = () => Promise.resolve()
    expect(await client.lcdConnected()).toBeTruthy()

    client.listKeys = () => Promise.reject()
    expect(await client.lcdConnected()).toBeFalsy()
  })

  it(`queries for indexed transactions`, async () => {
    let axios = require(`axios`)
    axios.get = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ data: [] }))
      .mockReturnValueOnce(Promise.resolve({ data: [`abc`] }))
    let result = await client.txs(`abc`)

    expect(axios.get).toHaveBeenCalledTimes(2)
    client.listKeys = () => Promise.resolve()
    expect(result).toEqual([`abc`])
  })

  it(`queries for a delegation summary for a delegator`, async () => {
    axios.get = jest.fn().mockReturnValue({})
    await client.getDelegator(`abc`)
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/stake/delegators/abc`,
      undefined
    ])
  })

  it(`queries for a delegation txs`, async () => {
    axios.get = jest
      .fn()
      .mockReturnValue(Promise.resolve({ data: lcdClientMock.txs }))
    await client.getDelegatorTxs(`abc`)
    await client.getDelegatorTxs(`abc`, [`bonding`])
    await client.getDelegatorTxs(`abc`, [`unbonding`])
    await client.getDelegatorTxs(`abc`, [`redelegate`])
    expect(axios.get.mock.calls).toEqual([
      [`${remoteLcdURL}/stake/delegators/abc/txs`, undefined],
      [`${remoteLcdURL}/stake/delegators/abc/txs?type=bonding`, undefined],
      [`${remoteLcdURL}/stake/delegators/abc/txs?type=unbonding`, undefined],
      [`${remoteLcdURL}/stake/delegators/abc/txs?type=redelegate`, undefined]
    ])
  })

  it(`queries for undelegations between a delegator and a validator`, async () => {
    axios.get = jest.fn().mockReturnValue({})
    await client.queryUnbonding(`abc`, `def`)
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/stake/delegators/abc/unbonding_delegations/def`,
      undefined
    ])
  })

  it(`queries for a validator`, async () => {
    axios.get = jest.fn().mockReturnValue({})
    await client.getCandidate(`abc`)
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/stake/validators/abc`,
      undefined
    ])
  })

  it(`queries for staking parameters`, async () => {
    axios.get = jest.fn().mockReturnValue({})
    await client.getParameters()
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/stake/parameters`,
      undefined
    ])
  })

  it(`queries for staking pool`, async () => {
    axios.get = jest.fn().mockReturnValue({})
    await client.getPool()
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/stake/pool`,
      undefined
    ])
  })

  it(`queries a validator signing information`, async () => {
    axios.get = jest.fn().mockReturnValue({})
    await client.queryValidatorSigningInfo(`pubKey`)
    expect(axios.get.mock.calls[0]).toEqual([
      `${remoteLcdURL}/slashing/signing_info/pubKey`,
      undefined
    ])
  })
})
