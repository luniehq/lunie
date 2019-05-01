import { shortAddress, coinsToObject, calculateShares } from "scripts/common"

describe(`shortAddress`, () => {
  const bech32ish = `asdf1asdfghjkl`

  it(`should treat bech32ish like bech32`, () => {
    const shortString = shortAddress(bech32ish)
    expect(shortString.toLowerCase()).toBe(`asdf…hjkl`)
  })
  it(`should return short bech32ish `, () => {
    const shortBech32ish = `as1d`
    const shortString = shortAddress(shortBech32ish)
    expect(shortString.toLowerCase()).toBe(`as1d`)
  })
})

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
