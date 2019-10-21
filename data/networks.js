const config = require('../config')

let networks = {
  'gaia-testnet': {
    api_url: 'https://gaia-13006.lunie.io',
    rpc_url: 'wss://gaia-13006.lunie.io:26657/websocket'
  },
  cosmoshub: {
    api_url: 'https://lcd.nylira.net',
    rpc_url: 'wss://rpc.nylira.net/websocket'
  },
  testnet: {
    api_url: 'http://localhost:9070',
    rpc_url: 'ws://localhost:26657/websocket'
  }
}

module.exports = {
  networks
}
