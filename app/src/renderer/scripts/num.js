import numeral from 'numeral'

function usd (num) {
  return numeral(num).format('$0,0.00')
}
function usdInt (num) {
  return numeral(num).format('$0,0')
}
function full (num) {
  return numeral(num).format('0,0.00000000')
}
function pretty (num) {
  return numeral(num).format('0,0.00')
}
function prettyInt (num) {
  return numeral(num).format('0,0')
}
function short (num) {
  if (num > 1000000000) {
    return pretty(num / 1000000000) + 'B'
  }
  if (num > 1000000) {
    return pretty(num / 1000000) + 'M'
  }
  if (num > 1000) {
    return pretty(num / 1000) + 'K'
  }
  return numeral(num).format('0,0.00')
}
function shortInt (num) {
  if (num > 1000000000) {
    return integerize(num / 1000000000) + 'B'
  }
  if (num > 1000000) {
    return integerize(num / 1000000) + 'MM'
  }
  if (num > 1000) {
    return integerize(num / 1000) + 'K'
  }
  return integerize(num)
}
function integerize (num) {
  return numeral(num).format('0,0')
}
function fractionize (num) {
  return numeral(num).format('.00')
}

export default {
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
