/* istanbul ignore file */

import gql from 'graphql-tag'

export const schemaMap = {
  cosmoshub: '',
  [`gaia-testnet`]: 'gaia_testnet_',
  testnet: 'gaia_testnet_'
}

export const Networks = gql`
  query Networks {
    networks {
      id
      chain_id
      testnet
      title
      rpc_url
    }
  }
`

// load all the data immediatly to avoid async loading later
export const NetworksAll = gql`
  query Networks($experimental: Boolean) {
    networks(experimental: $experimental) {
      id
      chain_id
      testnet
      title
      icon
      slug
      default
      powered {
        name
        providerAddress
        picture
      }
      feature_session
      feature_portfolio
      feature_validators
      feature_proposals
      feature_activity
      feature_explorer
      action_send
      action_claim_rewards
      action_delegate
      action_redelegate
      action_undelegate
      action_deposit
      action_vote
      action_proposal
      stakingDenom
      network_type
      address_creator
      address_prefix
      testnet
      enabled
    }
  }
`
