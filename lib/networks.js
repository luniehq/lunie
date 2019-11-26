const config = require('../config')
const networksMain = require('../data/networks.json')
const networksLocal = require('../data/networks-local.js')

let networks = networksMain
if (config.enableTestnet) {
  networks = { ...networks, ...networksLocal }
}

module.exports = {
  networks
}
