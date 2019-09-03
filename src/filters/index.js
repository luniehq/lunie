import { percent } from "../scripts/num"

export const percentOrPending = function(value, totalValue, pending) {
  return pending ? `--` : percent(totalValue === 0 ? 0 : value / totalValue)
}

export const formatBech32 = (address, longForm = false, length = 4) => {
  if (!address) {
    return `Address Not Found`
  } else if (address.indexOf(`1`) === -1) {
    return `Not A Valid Bech32 Address`
  } else if (longForm) {
    return address
  } else {
    return address.split(`1`)[0] + `…` + address.slice(-1 * length)
  }
}

export const resolveValidatorName = (address, validators) => {
  if (validators[address]) {
    return validators[address].description.moniker
  }
  return formatBech32(address)
}
