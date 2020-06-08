function fixDecimalsAndRoundUp(number, decimalsNumber) {
    return (
      (number.toFixed(decimalsNumber) * 10 ** decimalsNumber) /
      10 ** decimalsNumber
    )
}

module.exports = { fixDecimalsAndRoundUp }
