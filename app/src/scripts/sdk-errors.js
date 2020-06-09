/* istanbul ignore file */ //ignoring to not cover every code
// convert an SDK error code into a meaningful text message
export function getErrorMessage(code) {
  return (
    {
      1: `internal error`,
      2: `tx parse error`,
      3: `invalid sequence`,
      4: `unauthorized`,
      5: `insufficient funds`,
      6: `unknown request`,
      7: `invalid address`,
      8: `invalid pubkey`,
      9: `unknown address`,
      10: `insufficient coins`,
      11: `invalid coins`,
      12: `out of gas`,
      13: `memo too large`,
      14: `insufficient fee`,
      15: `maximum number of signatures exceeded`,
      16: `amount of gas exceeded maximum allowed size`,
      17: `no signatures supplied`,
    }[code] || `unknown error`
  )
}
