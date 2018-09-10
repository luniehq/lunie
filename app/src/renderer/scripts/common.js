const BN = require("bignumber.js")
module.exports.sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
// if given a valid address this will return the prefix plus some parameter
// length of the end. if it is not an address it will take that parameter
// length and return half of it as the beginning of the "address" and hald the end
module.exports.shortAddress = function(address, length = 4) {
  if (address.indexOf("1") === -1) {
    return address.length <= length
      ? address
      : address.slice(0, Math.floor(length / 2)) +
          "…" +
          address.slice(-1 * Math.ceil(length / 2))
  } else {
    if (length > address.split("1")[1].length) return address
    return address.split("1")[0] + "…" + address.slice(-1 * length)
  }
}
// could be used in optimistic update PR, pls uncomment or delete when addressed
// module.exports.calculateShares = function(delegator, tokens) {
//   let myTokens = new BN(tokens || 0)
//
//   let totalSharesN = new BN(delegator.delegator_shares.split("/")[0])
//   let totalSharesD = new BN(delegator.delegator_shares.split("/")[1])
//
//   let totalTokensN = new BN(delegator.tokens.split("/")[0])
//   let totalTokensD = new BN(delegator.tokens.split("/")[1])
//
//   return myTokens
//     .times(totalSharesN)
//     .times(totalTokensD)
//     .div(totalSharesD.times(totalTokensN))
// }

module.exports.calculateTokens = function(delegator, shares) {
  let myShares = new BN(shares || 0)
  // return myShares
  let totalSharesN = new BN(delegator.delegator_shares.split("/")[0])
  let totalSharesD = new BN(delegator.delegator_shares.split("/")[1] || 1)

  let totalTokensN = new BN(delegator.tokens.split("/")[0])
  let totalTokensD = new BN(delegator.tokens.split("/")[1] || 1)
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
