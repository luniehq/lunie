import {
  liquidAtoms,
  yourValidators,
  modalContext,
  validatorsWithRewards,
  totalRewards
} from "src/vuex/getters.js"
import validators from "./json/validators.js"

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

  describe(`yourValidators`, () => {
    it(`should return validators if signed in`, () => {
      expect(
        yourValidators(
          {
            session: { signedIn: true }
          },
          {
            committedDelegations: {
              [validators[0].operator_address]: 1,
              [validators[2].operator_address]: 2
            },
            delegates: { delegates: validators }
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
})
