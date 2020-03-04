const { keyBy } = require('lodash')
const config = require('../config')
const networksMain = require('../data/networks.js')
const networksLocal = require('../data/networks-local.js')

let networks = networksMain
if (config.enableTestnet || config.env === 'test') {
  networks = [...networks, ...networksLocal]
}

module.exports = {
  networkList: networks,
  networkMap: keyBy(networks, 'id'),
  allNetworks: [...networksMain, ...networksLocal]
}
