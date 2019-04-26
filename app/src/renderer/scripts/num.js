"use strict"
import BigNumber from "bignumber.js"

/**
 * Defines all numerical methods
 * @module num
 */

// truncate decimals to not round when using Intl.NumberFormat
function truncate(number, digits) {
  return Math.trunc(number * Math.pow(10, digits)) / Math.pow(10, digits)
}

export const SMALLEST = 1e-6
const language = window.navigator.userLanguage || window.navigator.language

export function setDecimalLength(value, length = 3) {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: length > 3 ? length : 0
  }).format(truncate(value, length))
}

export function pretty(number = 0) {
  return new Intl.NumberFormat(
    language,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(Math.round(number * 100) / 100)
}

// pretty print long decimals not in scientific notation
export function prettyDecimals(number = 0) {
  let longDecimals = new Intl.NumberFormat(
    language,
    { minimumFractionDigits: 20, maximumFractionDigits: 20 }
  ).format(number)

  // remove all trailing zeros
  while (longDecimals.charAt(longDecimals.length - 1) === `0`) {
    longDecimals = longDecimals.substr(0, longDecimals.length - 1)
  }

  // remove decimal separator from whole numbers
  if (Number.isNaN(Number(longDecimals.charAt(longDecimals.length - 1)))) {
    longDecimals = longDecimals.substr(0, longDecimals.length - 1)
  }

  return longDecimals
}

export function prettyInt(number = 0) {
  return new Intl.NumberFormat(language).format(Math.round(number))
}

export function percentInt(number = 0) {
  return new Intl.NumberFormat(language).format(Math.round(number * 100)) + `%`
}

export function percent(number = 0) {
  return new Intl.NumberFormat(
    language,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  ).format(Math.round(number * 10000) / 100) + `%`
}

export function atoms(number = 0) {
  return BigNumber(number).div(1e6).toNumber()
}

export function uatoms(number = 0) {
  return BigNumber(number).times(1e6).toString()
}

// convert micro denoms like uatom to display denoms like ATOM
export function viewDenom(denom) {
  if (denom.charAt(0) === `u`) {
    return denom.substr(1).toUpperCase()
  }
  return denom.toUpperCase()
}

export function createCoinObject({ amount, denom }, length = 3) {
  return {
    amount: setDecimalLength(atoms(amount), length),
    denom: viewDenom(denom)
  }
}

export default {
  SMALLEST,
  atoms,
  uatoms,
  viewDenom,
  createCoinObject,
  setDecimalLength,
  pretty,
  prettyInt,
  percent,
  percentInt,
  prettyDecimals
}
