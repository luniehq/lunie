import numeral from 'numeral'

function fiveNines (x) {
  return (Math.round(x * 10000) / 100).toFixed(3) + '%'
}
function usd (x) {
  return numeral(x).format('$0,0.00')
}
function usdInt (x) {
  return numeral(x).format('$0,0')
}
function full (x) {
  return numeral(x).format('0,0.00000000')
}
function pretty (x) {
  return numeral(x).format('0,0.000')
}
function prettyInt (x) {
  return numeral(x).format('0,0')
}
function short (x) {
  if (x > 1000000000) {
    return pretty(x / 1000000000) + 'B'
  }
  if (x > 1000000) {
    return pretty(x / 1000000) + 'M'
  }
  if (x > 1000) {
    return pretty(x / 1000) + 'K'
  }
  return numeral(x).format('0,0.00')
}
function shortInt (x) {
  if (x > 1000000000) {
    return integerize(x / 1000000000) + 'B'
  }
  if (x > 1000000) {
    return integerize(x / 1000000) + 'MM'
  }
  if (x > 1000) {
    return integerize(x / 1000) + 'K'
  }
  return integerize(x)
}
function integerize (x) {
  return numeral(x).format('0,0')
}
function fractionize (x) {
  return numeral(x).format('.00')
}

export default {
  fiveNines,
  usd,
  usdInt,
  full: full,
  pretty: pretty,
  prettyInt: prettyInt,
  int: integerize,
  frac: fractionize,
  short: short,
  shortInt
}
