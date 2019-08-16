import { coinsToObject, calculateShares } from "scripts/common"

describe(`calculateShares`, () => {
  it(`should calculates shares `, () => {
    const validator = {
      tokens: `100000000`,
      delegator_shares: ` 99999999.99995`
    }
    const tokens = `0.000000000005`
    const shares = calculateShares(validator, tokens).toNumber()
    expect(shares).toBe(5e-12)
  })
})

describe(`coinsToObject`, () => {
  it(`transforms coins arrays to object`, () => {
    const coinArray = [
      { denom: `stake`, amount: `100` },
      { denom: `photino`, amount: `15` }
    ]
    const coins = coinsToObject(coinArray)
    expect(coins).toMatchObject({
      stake: 100,
      photino: 15
    })
  })
})
