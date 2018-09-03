module.exports.sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports.shortAddress = function(address, length = 4) {
  if (address.indexOf("1") === -1) console.error("Not a bech32 Address")
  if (length > address.split("1")[1].length) return address
  return address.split("1")[0] + "…" + address.slice(-1 * length)
  // return address.length <= length
  //   ? address
  //   : address.slice(0, Math.floor(length / 2)) +
  //       "…" +
  //       address.slice(-1 * Math.ceil(length / 2))
}
