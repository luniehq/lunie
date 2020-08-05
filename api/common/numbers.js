const BigNumber = require('bignumber.js')

function fixDecimalsAndRoundUp(number, decimalsNumber) {
    return (
      (number.toFixed(decimalsNumber) * 10 ** decimalsNumber) /
      10 ** decimalsNumber
    )
}

function toViewDenom(network, chainDenomAmount, denom) {
  const coinLookup = network.coinLookup.find(coinLookup => coinLookup.chainDenom === denom || coinLookup.viewDenom === denom)
  return BigNumber(chainDenomAmount)
    .times(coinLookup.chainToViewConversionFactor)
    .toFixed(6)
}

module.exports = { fixDecimalsAndRoundUp, toViewDenom }
