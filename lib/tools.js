const bech32 = require('bech32')
const BigNumber = require('bignumber.js')

// share of all provisioned block rewards all delegators of this validator get
const provisionShare = (validator, totalStakedTokens) => {
  const validatorProvisionShare = validator.tokens / totalStakedTokens
  const delegatorProvisionShare =
    validatorProvisionShare * (1 - validator.commission.rate)

  return delegatorProvisionShare
}

// expected rewards if delegator stakes x tokens
const expectedRewards = (
  validator,
  totalStakedTokens,
  annualProvision,
  delegatedTokens
) => {
  if (validator.status === 0 || validator.jailed === true) {
    return 0
  }
  const delegatorProvisionShare = provisionShare(validator, totalStakedTokens)
  const annualAllDelegatorRewards = delegatorProvisionShare * annualProvision
  const annualDelegatorRewardsShare = delegatedTokens / validator.tokens
  const annualDelegatorRewards =
    annualDelegatorRewardsShare * annualAllDelegatorRewards
  return annualDelegatorRewards
}

// simplified expected rewards with a fixed token amount

module.exports = {
  decodeB32(value) {
    const words = bech32.decode(value)
    return Buffer.from(bech32.fromWords(words.words)).toString(`hex`)
  },
  encodeB32(value, prefix = `cosmos1`, type = `hex`) {
    const words = bech32.toWords(Buffer.from(value, type))
    return bech32.encode(prefix, words)
  },
  expectedReturns(validator, totalStakedTokens, annualProvision) {
    const standardizedTokenamount = 10000000000
    return (
      expectedRewards(
        validator,
        totalStakedTokens,
        annualProvision,
        standardizedTokenamount
      ) / standardizedTokenamount
    )
  },
  calculateTokens(validator, shares) {
    // this is the based on the idea that tokens should equal
    // (myShares / totalShares) * totalTokens where totalShares
    // and totalTokens are both represented as fractions
    const myShares = new BigNumber(shares || 0)
    const totalShares = new BigNumber(validator.delegatorShares)
    const totalTokens = new BigNumber(validator.tokens)

    if (totalShares.eq(0)) return new BigNumber(0)
    return myShares.times(totalTokens).div(totalShares)
  }
}
