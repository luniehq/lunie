import {
  oldBondedAtoms,
  liquidAtoms,
  totalAtoms,
  oldUnbondingAtoms,
  yourValidators,
  modalContext,
  validatorsWithRewards,
  totalRewards,
  flatOrderedTransactionList
} from "src/vuex/getters.js"

import validatorsFull from "./json/validators.js"

const validators = validatorsFull.slice(0, 3)

describe(`Store: getters`, () => {
  it(`liquidAtoms`, () => {
    const result = liquidAtoms({
      stakingParameters: { parameters: { bond_denom: `stake` } },
      wallet: {
        balances: [
          {
            denom: `stake`,
            amount: 42
          }
        ]
      }
    })

    expect(result).toBe(42)
  })

  it(`totalAtoms`, () => {
    const result = totalAtoms(
      {},
      {
        liquidAtoms: 2,
        oldBondedAtoms: `42`,
        oldUnbondingAtoms: 9
      }
    )

    expect(result).toBe(`53`)
  })

  it(`oldBondedAtoms`, () => {
    const result = oldBondedAtoms({
      delegation: {
        committedDelegates: {
          validator1: 42,
          validator2: 9
        }
      },
      delegates: {
        delegates: [
          {
            operator_address: `validator1`,
            delegator_shares: `1000`,
            tokens: `1000`
          },
          {
            operator_address: `validator2`,
            delegator_shares: `1000`,
            tokens: `100`
          }
        ]
      }
    })

    expect(result.toNumber()).toBe(42.9)
  })

  it(`oldUnbondingAtoms`, () => {
    const result = oldUnbondingAtoms({
      delegation: {
        unbondingDelegations: {
          validator1: [
            {
              balance: `42`
            }
          ],
          validator2: [
            {
              balance: `9`
            },
            {
              balance: `12`
            }
          ]
        }
      }
    })

    expect(result.toNumber()).toBe(63)
  })

  describe(`yourValidators`, () => {
    it(`should return validators if signed in`, () => {
      expect(
        yourValidators(
          {
            session: { signedIn: true },
            delegates: { delegates: validators }
          },
          {
            committedDelegations: {
              [validators[0].operator_address]: 1,
              [validators[2].operator_address]: 2
            }
          }
        )
      ).toEqual([validators[0], validators[2]])
    })

    it(`should return false if not signed in`, () => {
      expect(
        yourValidators(
          {
            session: { signedIn: false }
          },
          {
            committedDelegations: {
              [validators[0].operator_address]: 1,
              [validators[2].operator_address]: 2
            },
            delegates: { delegates: validators }
          }
        )
      ).toEqual([])
    })
  })

  it("validatorsWithRewards", () => {
    expect(
      validatorsWithRewards(
        {
          distribution: {
            rewards: {
              validator1: {
                stake: 10000
              },
              validator2: {
                stake: 5000
              },
              validator3: {
                stake: 0
              }
            }
          }
        },
        {
          bondDenom: "stake"
        }
      )
    ).toEqual([
      [
        "validator1",
        {
          stake: 10000
        }
      ],
      [
        "validator2",
        {
          stake: 5000
        }
      ]
    ])
  })

  it("totalRewards", () => {
    expect(
      totalRewards(null, {
        bondDenom: "stake",
        validatorsWithRewards: [
          [
            "validator1",
            {
              stake: 10000
            }
          ],
          [
            "validator2",
            {
              stake: 5000
            }
          ]
        ]
      })
    ).toBe(15000)
  })

  it(`modalContext`, () => {
    let state = {
      connection: {
        externals: {
          node: {
            url: "http://lunie.io"
          }
        },
        lastHeader: {
          chain_id: "cosmoshub"
        },
        connected: true
      },
      session: {
        address: "cosmos1abcdefghijklmop",
        localKeyPairName: "localKeyPairName"
      },
      distribution: {
        rewards: {
          validatorX: {
            uatom: 123
          }
        }
      },
      delegates: {
        delegates: []
      }
    }

    const getters = {
      bondDenom: "uatom",
      totalRewards: 123
    }

    const context = {
      url: "http://lunie.io",
      chainId: "cosmoshub",
      connected: true,
      userAddress: "cosmos1abcdefghijklmop",
      rewards: {
        validatorX: {
          uatom: 123
        }
      },
      delegates: [],
      localKeyPairName: "localKeyPairName",
      bondDenom: "uatom",
      totalRewards: 123
    }

    const result = modalContext(state, getters)

    expect(result).toEqual(context)
  })

  it("Flattens transactions into new format", () => {
    // global.Date = () => "2019-05-17T07:44:10Z"
    const original = [
      {
        height: "123456",
        txhash: "345768MBNVMNBVMNBV",
        raw_log: '[{"msg_index":"0","success":true,"log":""}]',
        logs: [{ msg_index: "0", success: true, log: "" }],
        gas_wanted: "24352",
        gas_used: "24292",
        tags: [
          { key: "action", value: "send" },
          {
            key: "sender",
            value: "cosmos1askljdhaslkdhaskldhasdlkjahlkajsh"
          },
          {
            key: "recipient",
            value: "cosmos1askljdhaslkdhaskldhasdlkjahlkajsh"
          }
        ],
        tx: {
          type: "auth/StdTx",
          value: {
            msg: [
              {
                type: "cosmos-sdk/MsgSend",
                value: {
                  from_address: "cosmos1askljdhaslkdhaskldhasdlkjahlkajsh",
                  to_address: "cosmos1askljdhaslkdhaskldhasdlkjahlkajsh",
                  amount: [{ denom: "uatom", amount: "50000" }]
                }
              }
            ],
            fee: { amount: null, gas: "24352" },
            signatures: [
              {
                pub_key: {
                  type: "tendermint/PubKeySecp256k1",
                  value: "KJHSADKJHSAjhlkjhaslkdhjKJHALSKDJH"
                },
                signature: "asdadasdasdasafafa/dadsadadasdasdasdas/JHG65876=="
              }
            ],
            memo: "(Sent via Lunie)"
          }
        },
        timestamp: "2019-05-17T07:44:10Z",
        type: "bank",
        time: "2019-05-17T07:44:10Z"
      }
    ]

    const state = {
      delegation: { unbondingDelegations: [] }
    }

    const getters = {
      allTransactions: original
    }

    const result = flatOrderedTransactionList(state, getters)

    const expected = [
      {
        type: "cosmos-sdk/MsgSend",
        value: {
          from_address: "cosmos1askljdhaslkdhaskldhasdlkjahlkajsh",
          to_address: "cosmos1askljdhaslkdhaskldhasdlkjahlkajsh",
          amount: [{ denom: "uatom", amount: "50000" }]
        },
        key: "345768MBNVMNBVMNBV",
        blockNumber: 123456,
        time: new Date("2019-05-17T07:44:10.000Z"),
        group: "banking",
        memo: "(Sent via Lunie)",
        fees: { amount: "0", denom: "ATOM" },
        liquidDate: null
      }
    ]

    expect(result).toEqual(expected)
  })
})
