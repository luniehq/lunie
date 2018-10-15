/**
 * @jest-environment node
 */

// The default environment in Jest is a browser-like environment through jsdom.
// https://jestjs.io/docs/en/configuration.html#testenvironment-string

// This environment creates a mock XMLHttpRequest which then causes Axios to
// think it's running in a browser, causing some network requests below to fail
// with only the message "Network Error".

let axios = require(`axios`)
const Express = require(`express`)
const http = require(`http`)
let LcdClient = require(`renderer/connectors/lcdClient.js`)
let lcdClientMock = require(`renderer/connectors/lcdClientMock.js`)
const path = require(`path`)
const createMiddleware = require(`swagger-express-middleware`)
const { promisify } = require(`util`)

describe(`LCD Client`, () => {
  describe(`helper functions`, () => {
    let axios
    let client

    beforeEach(() => {
      axios = {}
      client = LcdClient(axios, `http://localhost`, `http://remotehost`)
    })

    it(`makes a GET request with no args`, async () => {
      axios.get = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

      let res = await client.keys.values()
      expect(res).toEqual({ foo: `bar` })
      expect(axios.get.mock.calls[0]).toEqual([
        `http://localhost/keys`,
        undefined
      ])
    })

    it(`makes a GET request with one arg`, async () => {
      axios.get = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

      let res = await client.keys.get(`myKey`)
      expect(res).toEqual({ foo: `bar` })
      expect(axios.get.mock.calls[0]).toEqual([
        `http://localhost/keys/myKey`,
        undefined
      ])
    })

    it(`makes a POST request`, async () => {
      axios.post = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

      let res = await client.keys.add()
      expect(res).toEqual({ foo: `bar` })
      expect(axios.post.mock.calls[0]).toEqual([
        `http://localhost/keys`,
        undefined
      ])
    })

    it(`makes a POST request with args and data`, async () => {
      axios.put = jest
        .fn()
        .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

      let res = await client.keys.set(`myKey`, { abc: 123 })
      expect(res).toEqual({ foo: `bar` })
      expect(axios.put.mock.calls[0]).toEqual([
        `http://localhost/keys/myKey`,
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
        await await client.keys.values()
      } catch (err) {
        expect(err.message).toBe(`foo`)
      }
      expect(axios.get.mock.calls[0]).toEqual([
        `http://localhost/keys`,
        undefined
      ])
    })

    it(`delete requests have the correct format for data`, async () => {
      axios.delete = (path, config) => {
        expect(config).toEqual({ data: { password: `abc` } })
        return Promise.resolve({ data: { foo: `bar` } })
      }

      // doesn't throw
      await client.keys.delete(`test`, { password: `abc` })
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
  })

  let client
  let mockServer
  let remoteLcdURL

  beforeAll(async () => {
    const application = Express()

    const middleware = await promisify(createMiddleware)(
      path.join(__dirname, `../helpers/Gaia-Lite.yaml`),
      application
    )

    application.use(middleware.metadata())

    // The fact that /keys is a collection but /keys/seed is not a resource in
    // that collection confuses the Swagger middleware so we have to mock it
    // separately.

    application.get(`/keys/seed`, (request, response) => {
      response.send(request.swagger.path.get.responses[`200`].example)
    })

    application.use(
      // Why is this necessary?
      middleware.CORS(),

      middleware.parseRequest(),
      middleware.validateRequest(),
      middleware.mock()
    )

    mockServer = http.createServer(application)
    await promisify(mockServer.listen.bind(mockServer))(0, `localhost`)
    const localLcdURL = `http://localhost:${mockServer.address().port}`
    remoteLcdURL = `http://awesomenode.de:12345`
    client = LcdClient(axios, localLcdURL, remoteLcdURL)
  })

  afterAll(done => {
    mockServer.close(done)
  })

  describe(`Gaia-Lite`, () => {
    describe(`keys`, () => {
      it(`add`, async () => {
        await client.keys.add({
          name: `foo`,
          password: `1234567890`,
          seed: `seed some thin`
        })

        expect(await client.keys.get(`foo`)).toEqual({
          address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
          name: `foo`,
          password: `1234567890`,
          pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
          seed: `seed some thin`,
          type: `local`
        })
      })

      it(`delete`, async () => {
        await client.keys.add({
          name: `foo`,
          password: `1234567890`,
          seed: `seed some thin`
        })

        expect(await client.keys.values()).toEqual([
          {
            address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
            name: `foo`,
            password: `1234567890`,
            pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
            seed: `seed some thin`,
            type: `local`
          }
        ])

        await client.keys.delete(`foo`, { name: `foo`, password: `___` })
        expect(await client.keys.values()).toEqual([])
      })

      it(`get`, async () => {
        await client.keys.add({
          name: `foo`,
          password: `1234567890`,
          seed: `seed some thin`
        })

        expect(await client.keys.get(`foo`)).toEqual({
          address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
          name: `foo`,
          password: `1234567890`,
          pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
          seed: `seed some thin`,
          type: `local`
        })
      })

      // In the future we'll use the SDK's Swagger file instead of our own copy
      // and this test will dependend on
      // https://github.com/cosmos/cosmos-sdk/pull/2496 being merged.
      it(`get('seed')`, async () => {
        expect(await client.keys.get(`seed`)).toEqual(
          `blossom pool issue kidney elevator blame furnace winter account merry vessel security depend exact travel bargain problem jelly rural net again mask roast chest`
        )
      })

      it(`values`, async () => {
        await client.keys.add({
          name: `foo`,
          password: `1234567890`,
          seed: `seed some thin`
        })

        expect(await client.keys.values()).toEqual([
          {
            address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
            name: `foo`,
            password: `1234567890`,
            pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
            seed: `seed some thin`,
            type: `local`
          }
        ])
      })
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
      client.keys.values = () => Promise.resolve()
      expect(await client.lcdConnected()).toBeTruthy()

      client.keys.values = () => Promise.reject()
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
      client.keys.values = () => Promise.resolve()
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
})
