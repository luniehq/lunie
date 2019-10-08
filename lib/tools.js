const bech32 = require('bech32')

const hexToValidatorAddress = address => {
  let words = bech32.toWords(Buffer.from(address, 'hex'))
  return bech32.encode('cosmosvaloper', words)
}

exports.hexToValidatorAddress = hexToValidatorAddress
