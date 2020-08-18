const BigNumber = require('bignumber.js')

function fixDecimalsAndRoundUp(number, decimalsNumber) {
    return (
      (number.toFixed(decimalsNumber) * 10 ** decimalsNumber) /
      10 ** decimalsNumber
    )
}

function fixDecimalsAndRoundUpBigNumbers(bignumber, decimalsNumber, network, denom) {
  let coinLookup = network.coinLookup.find(({viewDenom}) => viewDenom === network.stakingDenom)
  if (denom) {
    coinLookup = network.coinLookup.find(coinLookup => coinLookup.chainDenom === denom || coinLookup.viewDenom === denom)
  }
  return fixDecimalsAndRoundUp(
    BigNumber(bignumber).times(
      coinLookup.chainToViewConversionFactor
    ),
    decimalsNumber
  )
}

function toViewDenom(network, chainDenomAmount, denom) {
  let coinLookup = network.coinLookup.find(({viewDenom}) => viewDenom === network.stakingDenom)
  if (denom) {
    coinLookup = network.coinLookup.find(coinLookup => coinLookup.chainDenom === denom || coinLookup.viewDenom === denom)
  }
  return BigNumber(chainDenomAmount)
    .times(coinLookup.chainToViewConversionFactor)
    .toFixed(6)
}

module.exports = { fixDecimalsAndRoundUp, fixDecimalsAndRoundUpBigNumbers, toViewDenom }
