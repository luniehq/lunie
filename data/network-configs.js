const config = require('../config')

const testnet = {
  id: 'local-cosmos-hub-testnet',
  title: 'Local Cosmos Testnet',
  chain_id: 'testnet',
  rpc_url: config.testnetRPC,
  api_url: config.testnetAPI,
  bech32_prefix: 'cosmos',
  testnet: true,
  feature_session: true,
  feature_portfolio: true,
  feature_validators: true,
  feature_proposals: true,
  feature_activity: true,
  feature_explorer: true,
  action_send: true,
  action_claim_rewards: true,
  action_delegate: true,
  action_redelegate: true,
  action_undelegate: true,
  action_deposit: true,
  action_vote: true,
  action_proposal: true,
  experimental: true,
  stakingDenom: 'STAKE'
}

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
  networks['local-cosmos-hub-testnet'] = testnet
}

module.exports = {
  networks
}
