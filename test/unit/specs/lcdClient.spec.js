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
const mung = require(`express-mung`)
const http = require(`http`)
let LcdClient = require(`renderer/connectors/lcdClient.js`)
let lcdClientMock = require(`renderer/connectors/lcdClientMock.js`)
let { proposals, deposits, votes } = lcdClientMock.state

const path = require(`path`)
const createMiddleware = require(`swagger-express-middleware`)
const { MemoryDataStore, Resource } = createMiddleware
const { promisify } = require(`util`)

describe(`LCD Client`, () => {
  describe(`Gaia-Lite`, () => {
    let client
    const dataStore = new MemoryDataStore()
    let mockServer

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

      // Don't return passwords.  This is a workaround to
      // https://github.com/APIDevTools/swagger-express-middleware/issues/18
      application.get(
        `/keys`,
        mung.json(body => {
          body.forEach(key => {
            delete key.password
          })

          return body
        })
      )

      // Don't return passwords.  This is a workaround to
      // https://github.com/APIDevTools/swagger-express-middleware/issues/18
      application.get(
        `/keys/:name`,
        mung.json(body => {
          delete body.password
          return body
        })
      )

      application.use(
        // Why is this necessary?
        middleware.CORS(),

        middleware.parseRequest(),
        middleware.validateRequest(),
        middleware.mock(dataStore)
      )

      mockServer = http.createServer(application)
      await promisify(mockServer.listen.bind(mockServer))(0, `localhost`)
      const localLcdURL = `http://localhost:${mockServer.address().port}`
      client = LcdClient(axios, localLcdURL, `http://remotehost`)
    })

    afterAll(done => {
      mockServer.close(done)
    })

    beforeEach(done => {
      const initialState = [
        {
          collection: `/keys`,
          name: `Main`,
          data: {
            address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
            name: `Main Account`,
            password: `password`,
            pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
            seed: `blossom pool issue kidney elevator blame furnace winter account merry vessel security depend exact travel bargain problem jelly rural net again mask roast chest`,
            type: `local`
          }
        }
      ]

      dataStore.save(Resource.parse(initialState), done)
    })

    afterEach(done => {
      dataStore.deleteCollection(`/keys`, done)
    })

    describe(`keys`, () => {
      it(`add`, async () => {
        jest.spyOn(console, `error`).mockImplementation(() => {})
        expect(await client.keys.get(`foo`)).toEqual(undefined)

        await client.keys.add({
          name: `foo`,
          password: `1234567890`,
          seed: `seed some thin`
        })

        expect(await client.keys.get(`foo`)).toEqual({
          address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
          name: `foo`,
          pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
          seed: `seed some thin`,
          type: `local`
        })

        console.error.mockReset()
      })

      it(`delete`, async () => {
        await client.keys.delete(`Main`, { password: `password` })
        expect(await client.keys.values()).toEqual([])
      })

      it(`get`, async () => {
        expect(await client.keys.get(`Main`)).toEqual({
          address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
          name: `Main Account`,
          pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
          seed: `blossom pool issue kidney elevator blame furnace winter account merry vessel security depend exact travel bargain problem jelly rural net again mask roast chest`,
          type: `local`
        })
      })

      it(`seed`, async () => {
        expect(await client.keys.seed()).toEqual(
          `blossom pool issue kidney elevator blame furnace winter account merry vessel security depend exact travel bargain problem jelly rural net again mask roast chest`
        )
      })

      it(`set`, async () => {
        await client.keys.set(`Main`, {
          new_password: `new password`,
          old_password: `password`
        })

        expect(
          (await promisify(dataStore.get.bind(dataStore))(`/keys/Main`)).data
            .new_password
        ).toEqual(`new password`)
      })

      it(`values`, async () => {
        expect(await client.keys.values()).toEqual([
          {
            address: `cosmoszgnkwr7eyyv643dllwfpdwensmgdtz89yu73zq`,
            name: `Main Account`,
            pub_key: `cosmospub1addwnpepqfgv3pakxazq2fgs8tmmhmzsrs94fptl7kyztyxprjpf0mkus3h7cxqe70s`,
            seed: `blossom pool issue kidney elevator blame furnace winter account merry vessel security depend exact travel bargain problem jelly rural net again mask roast chest`,
            type: `local`
          }
        ])
      })
    })
  })

  describe(`unit tests`, () => {
    let axios
    let client

    beforeEach(() => {
      axios = jest.fn()
      client = LcdClient(axios, `http://localhost`, `http://remotehost`)
    })

    describe(`helper functions`, () => {
      it(`makes a GET request with no args`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        let res = await client.keys.values()
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [{ data: undefined, method: `GET`, url: `http://localhost/keys` }]
        ])
      })

      it(`makes a GET request with one arg`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        let res = await client.keys.get(`myKey`)
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://localhost/keys/myKey`
            }
          ]
        ])
      })

      it(`makes a POST request`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        let res = await client.keys.add()
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [{ data: undefined, method: `POST`, url: `http://localhost/keys` }]
        ])
      })

      it(`makes a PUT request with args and data`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        let res = await client.keys.set(`myKey`, { abc: 123 })
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [
            {
              data: { abc: 123 },
              method: `PUT`,
              url: `http://localhost/keys/myKey`
            }
          ]
        ])
      })

      it(`makes a GET request with an error`, async () => {
        axios.mockReturnValueOnce(
          Promise.reject({
            response: {
              data: `foo`
            }
          })
        )

        try {
          await await client.keys.values()
        } catch (error) {
          expect(error.response.data).toBe(`foo`)
        }
        expect(axios.mock.calls).toEqual([
          [{ data: undefined, method: `GET`, url: `http://localhost/keys` }]
        ])
      })
    })

    describe(`stake`, () => {
      it(`queries for shares for a validator and delegate`, async () => {
        axios.mockReturnValueOnce(
          Promise.resolve({
            response: {
              data: {
                shares: 5
              }
            }
          })
        )
        await client.queryDelegation(`abc`, `efg`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/delegations/efg`
            }
          ]
        ])
      })

      it(`queries for a delegations of a delegator`, async () => {
        axios.mockReturnValue({})
        await client.getDelegations(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/delegations`
            }
          ]
        ])
      })

      it(`queries for a undelegations of a delegator`, async () => {
        axios.mockReturnValue({})
        await client.getUndelegations(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/unbonding_delegations`
            }
          ]
        ])
      })

      it(`queries for a redelegations of a delegator`, async () => {
        axios.mockReturnValue({})
        await client.getRedelegations(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/redelegations`
            }
          ]
        ])
      })

      it(`queries for a delegation txs`, async () => {
        axios.mockReturnValue(Promise.resolve({ data: lcdClientMock.txs }))
        await client.getDelegatorTxs(`abc`)
        await client.getDelegatorTxs(`abc`, [`bonding`])
        await client.getDelegatorTxs(`abc`, [`unbonding`])
        await client.getDelegatorTxs(`abc`, [`redelegate`])

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/txs`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/txs?type=bonding`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/txs?type=unbonding`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/txs?type=redelegate`
            }
          ]
        ])
      })

      it(`queries all validators that a delegator is bonded to`, async () => {
        axios.mockReturnValue({})
        await client.getDelegatorValidators(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/validators`
            }
          ]
        ])
      })

      it(`queries for undelegations between a delegator and a validator`, async () => {
        axios.mockReturnValue({})
        await client.queryUnbonding(`abc`, `def`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/delegators/abc/unbonding_delegations/def`
            }
          ]
        ])
      })

      it(`queries for a validator`, async () => {
        axios.mockReturnValue({})
        await client.getCandidate(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/validators/abc`
            }
          ]
        ])
      })

      it(`updateDelegations`, async () => {
        axios.mockReturnValue({})
        await client.updateDelegations(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `POST`,
              url: `http://localhost/stake/delegators/abc/delegations`
            }
          ]
        ])
      })

      it(`queries for staking parameters`, async () => {
        axios.mockReturnValue({})
        await client.getStakingParameters()

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/parameters`
            }
          ]
        ])
      })

      it(`queries for staking pool`, async () => {
        axios.mockReturnValue({})
        await client.getPool()

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/stake/pool`
            }
          ]
        ])
      })
    })

    describe(`Governance`, () => {
      it(`fetches all governance proposals`, async () => {
        axios.mockReturnValue({})
        await client.queryProposals()

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals`
            }
          ]
        ])
      })

      it(`queries a single proposal`, async () => {
        axios.mockReturnValue({})
        await client.queryProposal(`1`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals/1`
            }
          ]
        ])
      })

      it(`queries a proposal's tally`, async () => {
        axios.mockReturnValue({})
        await client.queryProposalTally(`1`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals/1/tally`
            }
          ]
        ])
      })

      it(`queries a proposal votes`, async () => {
        axios.mockReturnValue({})
        await client.queryProposalVotes(`1`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals/1/votes`
            }
          ]
        ])
      })

      it(`queries a proposal vote from an address`, async () => {
        axios.mockReturnValue({})
        await client.queryProposalVote(
          `1`,
          `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        )

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals/1/votes/cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
            }
          ]
        ])
      })

      it(`queries a proposal deposits`, async () => {
        axios.mockReturnValue({})
        await client.queryProposalDeposits(`1`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals/1/deposits`
            }
          ]
        ])
      })

      it(`queries a proposal deposit from an address`, async () => {
        axios.mockReturnValue({})
        await client.queryProposalDeposit(
          `1`,
          `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
        )

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/gov/proposals/1/deposits/cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
            }
          ]
        ])
      })

      it(`submits a new proposal`, async () => {
        axios.mockReturnValue({})
        await client.submitProposal(proposals[`1`])

        expect(axios.mock.calls).toEqual([
          [
            {
              data: proposals[`1`],
              method: `POST`,
              url: `http://remotehost/gov/proposals`
            }
          ]
        ])
      })

      it(`submits a new vote to a proposal`, async () => {
        axios.mockReturnValue({})
        await client.submitProposalVote(`1`, votes[0])

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `POST`,
              url: `http://remotehost/gov/proposals/1/votes`
            }
          ]
        ])
      })

      it(`submits a new deposit to a proposal`, async () => {
        axios.mockReturnValue({})
        await client.submitProposalDeposit(`1`, deposits[0])

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `POST`,
              url: `http://remotehost/gov/proposals/1/deposits`
            }
          ]
        ])
      })

      it(`queries for governance txs`, async () => {
        axios.mockReturnValue({ data: [] })
        await client.getGovernanceTxs(lcdClientMock.addresses[0])

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?tag=action='submit-proposal'&tag=proposer='${
                lcdClientMock.addresses[0]
              }'`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?tag=action='deposit'&tag=depositer='${
                lcdClientMock.addresses[0]
              }'`
            }
          ]
        ])
      })

      describe(`Parameters`, function() {
        it(`queries for governance deposit parameters`, async () => {
          axios.mockReturnValue({})
          await client.getGovDepositParameters()

          expect(axios.mock.calls).toEqual([
            [
              {
                data: undefined,
                method: `GET`,
                url: `http://remotehost/gov/parameters/deposit`
              }
            ]
          ])
        })

        it(`queries for governance tallying parameters`, async () => {
          axios.mockReturnValue({})
          await client.getGovTallyingParameters()

          expect(axios.mock.calls).toEqual([
            [
              {
                data: undefined,
                method: `GET`,
                url: `http://remotehost/gov/parameters/tallying`
              }
            ]
          ])
        })

        it(`queries for governance voting parameters`, async () => {
          axios.mockReturnValue({})
          await client.getGovVotingParameters()

          expect(axios.mock.calls).toEqual([
            [
              {
                data: undefined,
                method: `GET`,
                url: `http://remotehost/gov/parameters/voting`
              }
            ]
          ])
        })
      })
    })

    describe(`queryAccount`, () => {
      it(`returns an account`, async () => {
        axios.mockReturnValueOnce(
          Promise.resolve({
            data: {
              value: {
                type: `auth/Account`,
                value: {
                  address: `cosmosaccaddr1xr9rxc3jr6xzzugreykyrdsyjhtx8qvm4et3yp`,
                  coins: [{ denom: `steak`, amount: `10` }],
                  public_key: null,
                  account_number: `768`,
                  sequence: `0`
                }
              }
            }
          })
        )

        expect(await client.queryAccount(`address`)).toEqual({
          type: `auth/Account`,
          value: {
            account_number: `768`,
            address: `cosmosaccaddr1xr9rxc3jr6xzzugreykyrdsyjhtx8qvm4et3yp`,
            coins: [{ amount: `10`, denom: `steak` }],
            public_key: null,
            sequence: `0`
          }
        })
      })

      it(`does not throw error for empty results`, async () => {
        axios.mockReturnValueOnce(
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
        axios.mockReturnValueOnce(
          Promise.reject({
            response: {
              data: `something failed`
            }
          })
        )
        try {
          await client.queryAccount(`address`)
        } catch (error) {
          expect(error.response.data).toBe(`something failed`)
        }
      })
    })

    it(`checks for the connection with the lcd by performing a simple request`, async () => {
      client.keys.values = () => Promise.resolve()
      expect(await client.lcdConnected()).toBeTruthy()

      client.keys.values = () => Promise.reject()
      expect(await client.lcdConnected()).toBeFalsy()
    })

    it(`queries for indexed transactions`, async () => {
      axios
        .mockReturnValueOnce(Promise.resolve({ data: [] }))
        .mockReturnValueOnce(Promise.resolve({ data: [`abc`] }))
      let result = await client.txs(`abc`)

      expect(axios).toHaveBeenCalledTimes(2)
      client.keys.values = () => Promise.resolve()
      expect(result).toEqual([`abc`])
    })

    it(`gets the list of the validators in the latest validator set`, async () => {
      axios.mockReturnValue({})
      await client.getValidatorSet()

      expect(axios.mock.calls).toEqual([
        [
          {
            data: undefined,
            method: `GET`,
            url: `http://remotehost/validatorsets/latest`
          }
        ]
      ])
    })

    it(`queries a validator signing information`, async () => {
      axios.mockReturnValue({})
      await client.queryValidatorSigningInfo(`pubKey`)

      expect(axios.mock.calls).toEqual([
        [
          {
            data: undefined,
            method: `GET`,
            url: `http://remotehost/slashing/validators/pubKey/signing_info`
          }
        ]
      ])
    })
  })
})
