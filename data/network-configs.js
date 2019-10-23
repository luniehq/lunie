const config = require('../config')

let networks = {
  'cosmos-hub-testnet': {
    id: 'cosmos-hub-testnet',
    api_url: 'https://gaia-13006.lunie.io',
    rpc_url: 'wss://gaia-13006.lunie.io:26657/websocket'
  },
  'cosmos-hub-mainnet': {
    id: 'cosmos-hub-mainnet',
    api_url: 'https://lcd.nylira.net',
    rpc_url: 'wss://rpc.nylira.net/websocket'
  }
}

if (config.enableTestnet) {
  networks['local-cosmos-hub-testnet'] = {
    id: 'local-cosmos-hub-testnet',
    api_url: config.testnetAPI,
    rpc_url: config.testnetRPC
  }
}

module.exports = {
  networks
}
