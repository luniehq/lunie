/**
 * @jest-environment node
 */

// The default environment in Jest is a browser-like environment through jsdom.
// https://jestjs.io/docs/en/configuration.html#testenvironment-string

// This environment creates a mock XMLHttpRequest which then causes Axios to
// think it's running in a browser, causing some network requests below to fail
// with only the message "Network Error".

const LcdClient = require(`renderer/connectors/lcdClient.js`)
const lcdClientMock = require(`renderer/connectors/lcdClientMock.js`)
const { proposals, deposits, votes } = lcdClientMock.state

describe(`LCD Client`, () => {
  describe(`unit tests`, () => {
    let axios
    let client

    beforeEach(() => {
      axios = jest.fn(() => new Promise())
      client = LcdClient(axios, `http://remotehost`)
    })

    describe(`helper functions`, () => {
      it(`makes a GET request with no args`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        const res = await client.nodeVersion()
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/node_version`
            }
          ]
        ])
      })

      it(`makes a GET request with one arg`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        const res = await client.tx(`hashX`)
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs/hashX`
            }
          ]
        ])
      })

      it(`makes a POST request`, async () => {
        axios.mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))
        const res = await client.postTx({ x: 1 })
        expect(res).toEqual({ foo: `bar` })

        expect(axios.mock.calls).toEqual([
          [
            {
              data: { x: 1 },
              method: `POST`,
              url: `http://remotehost/tx/broadcast`
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
          await await client.nodeVersion()
        } catch (error) {
          expect(error.response.data).toBe(`foo`)
        }
        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/node_version`
            }
          ]
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
              url: `http://remotehost/staking/delegators/abc/delegations/efg`
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
              url: `http://remotehost/staking/delegators/abc/delegations`
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
              url: `http://remotehost/staking/delegators/abc/unbonding_delegations`
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
              url: `http://remotehost/staking/redelegations?delegator=abc`
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
              url: `http://remotehost/staking/delegators/abc/txs`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/staking/delegators/abc/txs?type=bonding`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/staking/delegators/abc/txs?type=unbonding`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/staking/delegators/abc/txs?type=redelegate`
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
              url: `http://remotehost/staking/delegators/abc/validators`
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
              url: `http://remotehost/staking/delegators/abc/unbonding_delegations/def`
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
              url: `http://remotehost/staking/validators/abc`
            }
          ]
        ])
      })

      it(`postDelegation`, async () => {
        axios.mockReturnValue({})
        await client.postDelegation(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `POST`,
              url: `http://remotehost/staking/delegators/abc/delegations`
            }
          ]
        ])
      })

      it(`postUnbondingDelegation`, async () => {
        axios.mockReturnValue({})
        await client.postUnbondingDelegation(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `POST`,
              url: `http://remotehost/staking/delegators/abc/unbonding_delegations`
            }
          ]
        ])
      })

      it(`postRedelegation`, async () => {
        axios.mockReturnValue({})
        await client.postRedelegation(`abc`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `POST`,
              url: `http://remotehost/staking/delegators/abc/redelegations`
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
              url: `http://remotehost/staking/parameters`
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
              url: `http://remotehost/staking/pool`
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
        await client.getProposalTally(`1`)

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
              url: `http://remotehost/txs?action=submit_proposal&proposer=${
                lcdClientMock.addresses[0]
              }`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=deposit&depositor=${
                lcdClientMock.addresses[0]
              }`
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
          value: {
            type: `auth/Account`,
            value: {
              account_number: `768`,
              address: `cosmosaccaddr1xr9rxc3jr6xzzugreykyrdsyjhtx8qvm4et3yp`,
              coins: [{ amount: `10`, denom: `steak` }],
              public_key: null,
              sequence: `0`
            }
          }
        })
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
      axios.mockResolvedValueOnce({
        data: {}
      })
      expect(await client.lcdConnected()).toBeTruthy()

      axios.mockReturnValueOnce(Promise.reject())
      expect(await client.lcdConnected()).toBeFalsy()
    })

    it(`queries for indexed transactions`, async () => {
      axios
        .mockReturnValueOnce(Promise.resolve({ data: [] }))
        .mockReturnValueOnce(Promise.resolve({ data: [`abc`] }))
      const result = await client.txs(`abc`)

      expect(axios).toHaveBeenCalledTimes(2)
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
