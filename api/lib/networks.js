const { keyBy } = require('lodash')
const config = require('../config')
const networksMain = require('../data/networks.js')
const networksLocal = require('../data/networks-local.js')

let networks = networksMain
if (config.enableTestnet || config.env === 'test') {
  networks = [...networks, ...networksLocal]
}
// if the RUN_ONLY_NETWORK env variable is set, we only run the especified network
if (process.env.RUN_ONLY_NETWORK) {
  networks = networks.filter(({ id }) => id === process.env.RUN_ONLY_NETWORK)
}
module.exports = {
  networkList: networks,
  networkMap: keyBy(networks, 'id'),
  allNetworks: [...networksMain, ...networksLocal]
}
