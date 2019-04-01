/* istanbul ignore file */ //ignoring to not cover every code
// convert an SDK error code into a meaningful text message
export function getErrorMessage(code) {
  switch (code) {
    case 1:
      return `internal error`
    case 2:
      return `tx parse error`
    case 3:
      return `invalid sequence`
    case 4:
      return `unauthorized`
    case 5:
      return `insufficient funds`
    case 6:
      return `unknown request`
    case 7:
      return `invalid address`
    case 8:
      return `invalid pubkey`
    case 9:
      return `unknown address`
    case 10:
      return `insufficient coins`
    case 11:
      return `invalid coins`
    case 12:
      return `out of gas`
    case 13:
      return `memo too large`
    case 14:
      return `insufficient fee`
    case 15:
      return `maximum number of signatures exceeded`
    case 16:
      return `amount of gas exceeded maximum allowed size`
    case 17:
      return `no signatures supplied`
    default:
      return `unknown error`
  }
}