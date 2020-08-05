const BigNumber = require('bignumber.js')

function fixDecimalsAndRoundUp(number, decimalsNumber) {
    return (
      (number.toFixed(decimalsNumber) * 10 ** decimalsNumber) /
      10 ** decimalsNumber
    )
}

function fixDecimalsAndRoundUpBigNumbers(bignumber, decimalsNumber, network, denom) {
  const coinLookup = network.coinLookup.find(({ viewDenom }) => viewDenom === denom)
  return fixDecimalsAndRoundUp(
    BigNumber(bignumber).times(
      coinLookup ? coinLookup.chainToViewConversionFactor :
      network.coinLookup[0].chainToViewConversionFactor
    ),
    decimalsNumber
  )
}

module.exports = { fixDecimalsAndRoundUp, fixDecimalsAndRoundUpBigNumbers }
