const { keyBy } = require('lodash')
const config = require('../config')
const networksMain = require('../data/networks.json')
const networksLocal = require('../data/networks-local.js')

let networks = networksMain
if (config.enableTestnet || config.env === 'test') {
  networks = [...networks, ...networksLocal]
}

networks = networks.filter(n => n.enabled)

module.exports = {
  networkList: networks,
  networkMap: keyBy(networks, 'id'),
  allNetworks: [...networksMain, ...networksLocal]
}
