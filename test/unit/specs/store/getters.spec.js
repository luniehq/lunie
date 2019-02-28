import { oldBondedAtoms, liquidAtoms, totalAtoms, oldUnbondingAtoms } from "renderer/vuex/getters.js"

describe(`Store: getters`, () => {
  it(`liquidAtoms`, () => {
    const result = liquidAtoms({
      stakingParameters: { parameters: { bond_denom: `stake` } },
      wallet: { balances: [{
        denom: `stake`,
        amount: 42
      }] }
    })

    expect(result).toBe(42)
  })

  it(`totalAtoms`, () => {
    const result = totalAtoms({}, {
      liquidAtoms: 2,
      oldBondedAtoms: `42`,
      oldUnbondingAtoms: 9
    })

    expect(result).toBe(`53`)
  })

  it(`oldBondedAtoms`, () => {
    const result = oldBondedAtoms({}, {
      delegation: {
        committedDelegates: {
          validator1: 42,
          validator2: 9
        }
      },
      delegates: {
        delegates: [{
          operator_address: `validator1`,
          delegator_shares: `1000`,
          tokens: `1000`
        }, {
          operator_address: `validator2`,
          delegator_shares: `1000`,
          tokens: `100`
        }]
      }
    })

    expect(result).toBe(`42.9`)
  })

  it(`oldUnbondingAtoms`, () => {
    const result = oldUnbondingAtoms({
      delegation: {
        unbondingDelegations: [{
          balance: { amount: 42 }
        }, {
          balance: { amount: 9 }
        }]
      }
    })

    expect(result).toBe(51)
  })
})