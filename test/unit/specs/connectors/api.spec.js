/**
 * @jest-environment node
 */

// The default environment in Jest is a browser-like environment through jsdom.
// https://jestjs.io/docs/en/configuration.html#testenvironment-string

// This environment creates a mock XMLHttpRequest which then causes Axios to
// think it's running in a browser, causing some network requests below to fail
// with only the message "Network Error".

const api = require(`src/connectors/api.js`).default
const lcdClientMock = require(`src/connectors/lcdClientMock.js`)
const { proposals, deposits, votes } = lcdClientMock.state

describe(`API`, () => {
  describe(`unit tests`, () => {
    let axios
    let client

    beforeEach(() => {
      axios = jest.fn(() => Promise.resolve({ data: { foo: `bar` } }))
      client = api(axios, `http://remotehost`)
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
              url: `http://remotehost/txs`
            }
          ]
        ])
      })

      it(`makes a GET request with an error`, async () => {
        axios.mockReturnValue(
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
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/node_version`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/node_version`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/node_version`
            }
          ]
        ])
      })

      it(`makes a GET request with an error and retrys`, async () => {
        axios
          .mockReturnValueOnce(
            Promise.reject({
              response: {
                data: `foo`
              }
            })
          )
          .mockReturnValueOnce(Promise.resolve({ data: { foo: `bar` } }))

        await await client.nodeVersion()
        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/node_version`
            }
          ],
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

    it(`queries a transaction by height`, async () => {
      axios.mockReturnValue({})
      await client.getTxsByHeight(`2`)
      expect(axios.mock.calls).toEqual([
        [
          {
            data: undefined,
            method: `GET`,
            url: `http://remotehost/txs?tx.height=2`
          }
        ]
      ])
    })

    describe(`Staking`, () => {
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
        await client.getDelegation(`abc`, `efg`)

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

      it(`queries for a staking txs`, async () => {
        axios.mockReturnValue(Promise.resolve({ data: lcdClientMock.txs }))
        await client.getStakingTxs(`abc`, `def`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=create_validator&destination-validator=def`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=edit_validator&destination-validator=def`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=delegate&delegator=abc`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=begin_redelegate&delegator=abc`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=begin_unbonding&delegator=abc`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=unjail&source-validator=def`
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
        await client.getUnbondingDelegation(`abc`, `def`)

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
        await client.getValidator(`abc`)

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
        await client.getProposals()

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
        await client.getProposal(`1`)

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
        await client.getProposalVotes(`1`)

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
        await client.getProposalVote(
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
        await client.getProposalDeposits(`1`)

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
        await client.getProposalDeposit(
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
        await client.postProposal(proposals[`1`])

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
        await client.postProposalVote(`1`, votes[0])

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
        await client.postProposalDeposit(`1`, deposits[0])

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
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=vote&voter=${
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

    describe(`getAccount`, () => {
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

        expect(await client.getAccount(`address`)).toEqual({
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
        const res = await client.getAccount(`address`)
        expect(res).toEqual({
          coins: [],
          sequence: `0`,
          account_number: `0`
        })
      })

      it(`does not throw error for failed merkle proof error`, async () => {
        axios.mockReturnValueOnce(
          Promise.reject({
            response: {
              data: `failed to prove merkle proof`
            }
          })
        )
        const res = await client.getAccount(`address`)
        expect(res).toEqual({
          coins: [],
          sequence: `0`,
          account_number: `0`
        })
      })

      it(`throws error for error other than empty account`, async () => {
        axios.mockReturnValue(
          Promise.reject({
            response: {
              data: `something failed`
            }
          })
        )
        try {
          await client.getAccount(`address`)
        } catch (error) {
          expect(error.response.data).toBe(`something failed`)
        }
      })

      it(`returns a flat response for vesting account`, async () => {
        axios.mockReturnValueOnce(
          Promise.resolve({
            data: {
              type: `auth/DelayedVestingAccount`,
              value: {
                BaseVestingAccount: {
                  BaseAccount: {
                    coins: [{ x: 1 }],
                    sequence: `1`,
                    account_number: `213`
                  },
                  vestingProp: `Y`
                }
              }
            }
          })
        )
        const res = await client.getAccount(`address`)
        expect(res).toEqual({
          coins: [{ x: 1 }],
          sequence: `1`,
          account_number: `213`,
          vestingProp: `Y`
        })
      })

      it(`shows an error if vesting format changed`, async () => {
        const spy = jest
          .spyOn(console, `error`)
          .mockImplementationOnce(() => {})
        axios.mockReturnValueOnce(
          Promise.resolve({
            data: {
              type: `auth/DelayedVestingAccount`,
              value: {
                xxx: {}
              }
            }
          })
        )
        const res = await client.getAccount(`address`)
        expect(res).toEqual({
          coins: [],
          sequence: `0`,
          account_number: `0`
        })
        expect(spy).toHaveBeenCalled()
        console.error.mockReset()
      })
    })

    describe(`Fee Distribution`, () => {
      it(`queries for governance txs`, async () => {
        axios.mockReturnValue({ data: [] })
        await client.getDistributionTxs(
          `cosmos1address`,
          `cosmosvaloper1address`
        )

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=set_withdraw_address&delegator=cosmos1address`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=withdraw_delegator_reward&delegator=cosmos1address`
            }
          ],
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/txs?action=withdraw_validator_rewards_all&source-validator=cosmosvaloper1address`
            }
          ]
        ])
      })
      it(`queries all rewards from a delegator`, async () => {
        axios.mockReturnValue({})
        await client.getDelegatorRewards(`cosmos1address`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/distribution/delegators/cosmos1address/rewards`
            }
          ]
        ])
      })

      it(`withdraws all rewards from a delegator`, async () => {
        axios.mockReturnValue({})
        await client.postWithdrawDelegatorRewards(`cosmos1address`, {})

        expect(axios.mock.calls).toEqual([
          [
            {
              data: {},
              method: `POST`,
              url: `http://remotehost/distribution/delegators/cosmos1address/rewards`
            }
          ]
        ])
      })

      it(`queries a single reward of a delegator from a validator`, async () => {
        axios.mockReturnValue({})
        await client.getDelegatorRewardsFromValidator(
          `cosmos1address`,
          `cosmosvaloper1address`
        )

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/distribution/delegators/cosmos1address/rewards/cosmosvaloper1address`
            }
          ]
        ])
      })

      it(`queries a validator distribution info`, async () => {
        axios.mockReturnValue({})
        await client.getValidatorDistributionInformation(
          `cosmosvaloper1address`
        )

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/distribution/validators/cosmosvaloper1address`
            }
          ]
        ])
      })

      it(`queries all self-delegation rewards from a validator`, async () => {
        axios.mockReturnValue({})
        await client.getValidatorRewards(`cosmosvaloper1address`)

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/distribution/validators/cosmosvaloper1address/rewards`
            }
          ]
        ])
      })

      it(`queries all distribution parameters`, async () => {
        axios.mockReturnValue({})
        await client.getDistributionParameters()

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/distribution/parameters`
            }
          ]
        ])
      })

      it(`queries all distribution outstanding rewards`, async () => {
        axios.mockReturnValue({})
        await client.getDistributionOutstandingRewards()

        expect(axios.mock.calls).toEqual([
          [
            {
              data: undefined,
              method: `GET`,
              url: `http://remotehost/distribution/outstanding_rewards`
            }
          ]
        ])
      })
    })

    it(`checks for the connection with the lcd by performing a simple request`, async () => {
      axios.mockResolvedValueOnce({
        data: {}
      })
      expect(await client.lcdConnected()).toBeTruthy()

      axios.mockReturnValue(Promise.reject())
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

    it(`gets the list of the validators`, async () => {
      axios.mockReturnValue({})
      await client.getValidators()

      expect(axios.mock.calls).toEqual([
        [
          {
            data: undefined,
            method: "GET",
            url: "http://remotehost/staking/validators?status=bonded"
          }
        ],
        [
          {
            data: undefined,
            method: "GET",
            url: "http://remotehost/staking/validators?status=unbonded"
          }
        ],
        [
          {
            data: undefined,
            method: "GET",
            url: "http://remotehost/staking/validators?status=unbonding"
          }
        ]
      ])
    })

    it(`queries a validator signing information`, async () => {
      axios.mockReturnValue({})
      await client.getValidatorSigningInfo(`pubKey`)

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

    it(`gets a block based on the height`, async () => {
      axios.mockReturnValue({})
      await client.getBlock(`123`)

      expect(axios.mock.calls).toEqual([
        [
          {
            data: undefined,
            method: `GET`,
            url: `http://remotehost/blocks/123`
          }
        ]
      ])
    })
  })
})
