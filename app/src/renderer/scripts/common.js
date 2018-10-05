"use strict"

const BN = require(`bignumber.js`).BigNumber

// convert rat format ('123/456') to big number
module.exports.ratToBigNumber = function(rat) {
  let n = new BN(rat.split(`/`)[0])
  let d = new BN(rat.split(`/`)[1] || 1)
  return n.div(d)
}
// TODO uncomment when validator comission is done
// module.exports.parseValidatorShares = function(validator) {
//   let totalSharesN = new BN(validator.delegator_shares.split("/")[0])
//   let totalSharesD = new BN(validator.delegator_shares.split("/")[1] || 1)
//   return totalSharesN.div(totalSharesD)
// }
//
// module.exports.parseValidatorShares = function(validator) {
//   let totalTokensN = new BN(validator.tokens.split("/")[0])
//   let totalTokensD = new BN(validator.tokens.split("/")[1] || 1)
//   return totalTokensN.div(totalTokensD)
// }

// could be used in optimistic update PR, pls uncomment or delete when addressed
module.exports.calculateShares = function(validator, tokens) {
  let myTokens = new BN(tokens || 0)

  let totalSharesN = new BN(validator.delegator_shares.split(`/`)[0])
  let totalSharesD = new BN(validator.delegator_shares.split(`/`)[1] || 1)

  let totalTokensN = new BN(validator.tokens.split(`/`)[0])
  let totalTokensD = new BN(validator.tokens.split(`/`)[1] || 1)

  if (totalTokensN.eq(0)) return new BN(0)
  return myTokens
    .times(totalSharesN)
    .times(totalTokensD)
    .div(totalSharesD.times(totalTokensN))
}

module.exports.calculateTokens = function(validator, shares) {
  // this is the based on the idea that tokens should equal
  // (myShares / totalShares) * totalTokens where totalShares
  // and totalTokens are both represented as fractions
  let myShares = new BN(shares || 0)
  let totalSharesN = new BN(validator.delegator_shares.split(`/`)[0])
  let totalSharesD = new BN(validator.delegator_shares.split(`/`)[1] || 1)

  let totalTokensN = new BN(validator.tokens.split(`/`)[0])
  let totalTokensD = new BN(validator.tokens.split(`/`)[1] || 1)
  if (totalSharesN.eq(0)) return new BN(0)
  return myShares
    .times(totalSharesD)
    .times(totalTokensN)
    .div(totalSharesN.times(totalTokensD))
}

module.exports.sleep = function(amount) {
  return new Promise(resolve => {
    setTimeout(resolve, amount)
  })
}
