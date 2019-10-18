const bech32 = require('bech32')
const BigNumber = require('bignumber.js')
const crypto = require('crypto')

const hexToValidatorAddress = address => {
  let words = bech32.toWords(Buffer.from(address, 'hex'))
  return bech32.encode('cosmosvalcons', words)
}
const pubkeyToAddress = cosmosvalconspub => {
  const words = bech32.decode(cosmosvalconspub).words
  // publickey is prefixed somehow (probably amino)
  const publicKey = Buffer.from(
    Buffer.from(bech32.fromWords(words))
      .toString('hex')
      .substr(10),
    'hex'
  )
  // the address is the first 20 bytes of the sha256 hash of the publickey
  const hexAddress = crypto
    .createHash('sha256')
    .update(publicKey)
    .digest()
    .toString('hex')
    .substr(0, 40)
  return hexToValidatorAddress(hexAddress)
}

// expected rewards if delegator stakes x tokens
const expectedRewards = (validator, annualProvision, delegatedTokens) => {
  if (validator.status === 0 || validator.jailed === true) {
    return 0
  }
  const delegatorProvisionShare = BigNumber(validator.voting_power)
  const annualAllDelegatorRewards = delegatorProvisionShare.times(
    annualProvision
  )
  const annualDelegatorRewardsShare = BigNumber(delegatedTokens).div(
    validator.tokens
  )
  const annualDelegatorRewards = BigNumber(annualDelegatorRewardsShare).times(
    annualAllDelegatorRewards
  )
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
  expectedReturns(validator, annualProvision) {
    const standardizedTokenamount = 10000000000
    return (
      expectedRewards(validator, annualProvision, standardizedTokenamount) /
      standardizedTokenamount
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
  },
  pubkeyToAddress
}
