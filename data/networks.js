let networks = {
  'gaia-testnet': {
    api_url: 'https://gaia-13006.lunie.io',
    rpc_url: 'wss://gaia-13006.lunie.io:26657/websocket',
    action_claim_rewards: false,
    action_delegate: false,
    action_deposit: false,
    action_proposal: false,
    action_redelegate: false,
    action_send: false,
    action_undelegate: false,
    action_vote: false,
    bech32_prefix: 'cosmos',
    chain_id: 'gaia-13006',
    experimental: true,
    feature_activity: false,
    feature_explorer: false,
    feature_portfolio: false,
    feature_proposals: true,
    feature_session: true,
    feature_validators: true,
    id: 'gaia-testnet',
    logo_url: 'https://s3.amazonaws.com/network.logos/cosmos-logo.png',
    testnet: true,
    title: 'Gaia Testnet'
  },
  cosmoshub: {
    api_url: 'https://lcd.nylira.net',
    rpc_url: 'wss://rpc.nylira.net/websocket',
    action_claim_rewards: true,
    action_delegate: true,
    action_deposit: true,
    action_proposal: true,
    action_redelegate: true,
    action_send: true,
    action_undelegate: true,
    action_vote: true,
    bech32_prefix: 'cosmos',
    chain_id: 'cosmoshub-2',
    experimental: true,
    feature_activity: true,
    feature_explorer: true,
    feature_portfolio: true,
    feature_proposals: true,
    feature_session: true,
    feature_validators: true,
    id: 'cosmoshub',
    logo_url: 'https://s3.amazonaws.com/network.logos/cosmos-logo.png',
    testnet: false,
    title: 'Cosmos Hub'
  }
}

const testnet = {
  api_url: 'http://localhost:9070',
  rpc_url: 'ws://localhost:26657/websocket',
  action_claim_rewards: true,
  action_delegate: true,
  action_deposit: true,
  action_proposal: true,
  action_redelegate: true,
  action_send: true,
  action_undelegate: true,
  action_vote: true,
  bech32_prefix: 'cosmos',
  chain_id: 'testnet',
  experimental: true,
  feature_activity: true,
  feature_explorer: true,
  feature_portfolio: true,
  feature_proposals: true,
  feature_session: true,
  feature_validators: true,
  id: 'testnet',
  logo_url: 'https://s3.amazonaws.com/network.logos/cosmos-logo.png',
  testnet: false,
  title: 'Testnet'
}

if (process.env.NODE_ENV === 'development') {
  networks.testnet = testnet
}

function getNetworks() {
  return networks
}

function getNetwork(name) {
  return networks.find(network => network.id === name)
}

module.exports = {
  networks,
  getNetworks,
  getNetwork
}
