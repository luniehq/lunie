const config = require('../config')

module.exports = {
  'local-cosmos-hub-testnet': {
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
}
