const { getNetworkCapabilities } = require('./network-capabilities')
const config = require('../config')

module.exports = [
  {
    id: 'local-cosmos-hub-testnet',
    title: 'Local Cosmos Testnet',
    chain_id: 'testnet',
    rpc_url: config.testnetRPC,
    api_url: config.testnetAPI,
    bech32_prefix: 'cosmos',
    address_prefix: 'cosmos',
    address_creator: 'cosmos',
    network_type: 'cosmos',
    ledger_app: 'cosmos',
    source_class_name: 'source/cosmosV2-source',
    block_listener_class_name: 'block-listeners/cosmos-node-subscription',
    testnet: true,
    ...getNetworkCapabilities[`local-cosmos-hub-testnet`],
    experimental: true,
    stakingDenom: 'STAKE',
    enabled: true,
    default: false
  }
]
