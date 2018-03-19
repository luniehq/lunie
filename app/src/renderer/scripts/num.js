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
  if (num >= 1000000000) {
    return pretty(num / 1000000000) + 'B'
  }
  if (num >= 1000000) {
    return pretty(num / 1000000) + 'M'
  }
  if (num >= 1000) {
    return pretty(num / 1000) + 'K'
  }
  return numeral(num).format('0.00')
}
function shortInt (num) {
  if (num > 1000) {
    return short(num)
  }
  return prettyInt(num)
}
function percentInt (x) {
  return numeral(x).format('0%')
}
function percent (x) {
  return numeral(x).format('0.00%')
}

export default {
  usd,
  usdInt,
  full,
  pretty,
  prettyInt,
  short,
  shortInt,
  percent,
  percentInt
}
