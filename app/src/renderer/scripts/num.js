"use strict"
import BigNumber from "bignumber.js"

/**
 * Defines all numerical methods
 * @module num
 */

const SMALLEST = 1e-7
const language = window.navigator.userLanguage || window.navigator.language
function full(number = 0) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 7 })
    .format(number)
}
function shortNumber(number = 0) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 4 }).format(number) + `…`
}
function pretty(number = 0) {
  return new Intl.NumberFormat(
    language,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(Math.round(number * 100) / 100)
}
// pretty print long decimals not in scientific notation
function prettyDecimals(number = 0) {
  let longDecimals = new Intl.NumberFormat(
    language,
    { minimumFractionDigits: 20, maximumFractionDigits: 20 }
  ).format(number)

  // remove all trailing zeros
  while(longDecimals.charAt(longDecimals.length - 1) === `0`) {
    longDecimals = longDecimals.substr(0, longDecimals.length - 1)
  }

  return longDecimals
}
function prettyInt(number = 0) {
  return new Intl.NumberFormat(language).format(Math.round(number))
}
function percentInt(number = 0) {
  return new Intl.NumberFormat(language).format(Math.round(number * 100)) + `%`
}
function percent(number = 0) {
  return new Intl.NumberFormat(
    language,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(Math.round(number * 10000) / 100) + `%`
}
function atoms(number = 0) {
  return BigNumber(number).div(10e6).toNumber()
}
function uatoms(number = 0) {
  return BigNumber(number).times(10e6).toString()
}

module.exports = {
  SMALLEST,
  atoms,
  uatoms,
  full,
  shortNumber,
  pretty,
  prettyInt,
  percent,
  percentInt,
  prettyDecimals
}
