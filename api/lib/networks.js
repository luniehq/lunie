const { keyBy } = require('lodash')
const networksMain = require('../data/networks.js')

let networks = networksMain
// if the RUN_ONLY_NETWORK env variable is set, we only run the especified network
if (process.env.RUN_ONLY_NETWORK) {
  networks = networks.filter(({ id }) => id === process.env.RUN_ONLY_NETWORK)
}
module.exports = {
  networkList: networks,
  networkMap: keyBy(networks, 'id'),
  allNetworks: networksMain
}
