"use strict"
import BigNumber from "bignumber.js"

/**
 * Defines all numerical methods
 * @module num
 */

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
  atoms,
  uatoms,
  full,
  shortNumber,
  pretty,
  prettyInt,
  percent,
  percentInt
}
