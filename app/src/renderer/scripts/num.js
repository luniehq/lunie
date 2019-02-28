"use strict"
import BigNumber from "bignumber.js"

/**
 * Defines all numerical methods
 * @module num
 */

const numeral = require(`numeral`)
function usd(num) {
  return numeral(num).format(`$0,0.00`)
}
function usdInt(num) {
  return numeral(num).format(`$0,0`)
}
function full(num) {
  return numeral(num).format(`0,0.0000000000`)
}
function shortNumber(num) {
  return numeral(num).format(`0,0.0000`) + `…`
}
function pretty(num) {
  return numeral(num).format(`0,0.00`)
}
function prettyInt(num) {
  return numeral(num).format(`0,0`)
}
function short(num) {
  if (num >= 1000000000) {
    return pretty(num / 1000000000) + `B`
  }
  if (num >= 1000000) {
    return pretty(num / 1000000) + `M`
  }
  if (num >= 1000) {
    return pretty(num / 1000) + `K`
  }
  return numeral(num).format(`0.00`)
}
function shortInt(num) {
  if (num > 1000) {
    return short(num)
  }
  return prettyInt(num)
}
function percentInt(x) {
  return numeral(x).format(`0%`)
}
function percent(x) {
  return numeral(x).format(`0.00%`)
}
function atoms(x) {
  return BigNumber(x).div(10e6).toNumber()
}
function uatoms(x) {
  return BigNumber(x).times(10e6).toNumber()
}

module.exports = {
  atoms,
  uatoms,
  usd,
  usdInt,
  full,
  shortNumber,
  pretty,
  prettyInt,
  short,
  shortInt,
  percent,
  percentInt
}
