"use strict"
import BigNumber from "bignumber.js"

/**
 * Defines all numerical methods
 * @module num
 */

const language = window.navigator.userLanguage || window.navigator.language
function full(number) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 7 }).format(number)
}
function shortNumber(number) {
  return new Intl.NumberFormat(language, { minimumFractionDigits: 4 }).format(number) + `…`
}
function pretty(number) {
  return new Intl.NumberFormat(language).format(Math.round(number * 100) / 100)
}
function prettyInt(number) {
  return new Intl.NumberFormat(language).format(Math.round(number))
}
function percentInt(number) {
  return new Intl.NumberFormat(language).format(Math.round(number * 100)) + `%`
}
function percent(number) {
  return new Intl.NumberFormat(language).format(number * 100) + `%`
}
function atoms(x) {
  return BigNumber(x).div(10e6).toFixed(7)
}
function uatoms(x) {
  return BigNumber(x).times(10e6).toFixed(7)
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
