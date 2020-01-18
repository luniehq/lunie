const config = require('../config')

module.exports = [
  {
    id: 'local-cosmos-hub-testnet',
    title: 'Local Cosmos Testnet',
    chain_id: 'testnet',
    rpc_url: config.testnetRPC,
    api_url: config.testnetAPI,
    bech32_prefix: 'cosmos',
    source_class_name: 'source/cosmosV2-source',
    block_listener_class_name: 'block-listeners/cosmos-node-subscription',
    testnet: true,
    feature_explore: true,
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
    stakingDenom: 'STAKE',
    enabled: true,
    default: false
  }
]
