import {
  oldBondedAtoms,
  liquidAtoms,
  totalAtoms,
  oldUnbondingAtoms,
  yourValidators,
  modalContext
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
    const result = oldBondedAtoms(
      {},
      {
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
      }
    )

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
      delegation: {
        committedDelegates: []
      }
    }

    const context = {
      url: "http://lunie.io",
      chainId: "cosmoshub",
      connected: true,
      userAddress: "cosmos1abcdefghijklmop",
      committedDelegations: [],
      localKeyPairName: "localKeyPairName"
    }

    const result = modalContext(state)

    expect(result).toEqual(context)
  })
})
