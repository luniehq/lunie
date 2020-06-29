const Sentry = require('@sentry/node')
const database = require('../lib/database')
const config = require('../config')
const networks = require('../data/networks')

async function storeNetworks() {
    try {
        await Promise.all(
            networks.map(network => {
                // prepare network with the format we are going to store it in public/networks
                const dbNetwork = formatNetworkForDB(network)
                // store network in DB under public/networks
                database(config)('').storeNetwork(dbNetwork)
            })
        )
    } catch (error) {
      console.error('Failed while storing networks in DB', error)
      Sentry.captureException(error)
    }
}

function formatNetworkForDB(network) {
    // removed enabled
    return {
      network: {
        id: network.id,
        title: network.title,
        chain_id: network.chain_id,
        rpc_url: network.rpc_url,
        api_url: network.api_url,
        bech32_prefix: network.bech32_prefix,
        testnet: network.testnet,
        default: network.default,
        stakingDenom: network.stakingDenom,
        address_prefix: network.address_prefix,
        address_creator: network.address_creator,
        ledger_app: network.ledger_app,
        network_type: network.network_type,
        source_class_name: network.source_class_name,
        block_listener_class_name: network.block_listener_class_name,
        experimental: network.experimental,
        icon: network.icon,
        slug: network.slug,
        lockUpPeriod: network.lockUpPeriod,
        powered: JSON.stringify(network.powered)
      },
      coinLookups: network.coinLookup.map((coinLookup) => ({
        id: network.id,
        viewDenom: coinLookup.viewDenom,
        chainDenom: coinLookup.chainDenom,
        chainToViewConversionFactor: coinLookup.chainToViewConversionFactor
      })),
      networksCapabilities: {
        id: network.id,
        feature_session: network.feature_session,
        feature_portfolio: network.feature_portfolio,
        feature_validators: network.feature_validators,
        feature_proposals: network.feature_proposals,
        feature_activity: network.feature_activity,
        feature_explorer: network.feature_explorer,
        feature_explore: network.feature_explore,
        action_send: network.action_send,
        action_claim_rewards: network.action_claim_rewards,
        action_delegate: network.action_delegate,
        action_redelegate: network.action_delegate,
        action_undelegate: network.action_delegate,
        action_deposit: network.action_delegate,
        action_vote: network.action_delegate,
        action_proposal: network.action_delegate
      }
    }
}

storeNetworks()