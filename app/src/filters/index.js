import { percent } from "../scripts/num"
import moment from "moment"
import bech32 from "bech32"

export const date = (date) => moment(date).format("MMMM Do YYYY, HH:mm")

export const fromNow = (date) => moment(date).fromNow()

export const noBlanks = function (value) {
  return value === undefined ||
    value === null ||
    value === `` ||
    value === `[do-not-modify]`
    ? `--`
    : value
}

export const percentOrPending = function (value, totalValue, pending) {
  return pending ? `--` : percent(totalValue === 0 ? 0 : value / totalValue)
}

const getAddressType = (address) => {
  if (address.startsWith("0x")) return "ethereum"
  try {
    bech32.decode(address)
    return "cosmos"
  } catch (error) {
    // ignore error
  }
  return "any"
}

export const formatAddress = (address, length = 4) => {
  if (!address) {
    return `Address Not Found`
  }
  switch (getAddressType(address)) {
    case "cosmos":
      return address.split(`1`)[0] + `…` + address.slice(-1 * length)
    case "ethereum":
      return address.slice(0, 2 + length) + `…` + address.slice(-1 * length)
    case "any":
      return address.slice(0, length) + `…` + address.slice(-1 * length)
  }
}

export const resolveValidatorName = (address, validators) => {
  // Substrate validators can have their operatorAddress as their name, which is too long and thus breaks the
  // extension size. If name is too long, then we just display the formatted address
  if (validators[address] && validators[address].name.length < 20) {
    return validators[address].name
  }
  return formatAddress(address)
}

export const validatorEntry = (validator) =>
  `${validator.name} - ${formatAddress(validator.operatorAddress, 20)}`
