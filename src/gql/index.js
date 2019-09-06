/* istanbul ignore file */

import gql from "graphql-tag"

const ValidatorFragment = gql`
  fragment ValidatorParts on allValidators {
    avatarUrl
    consensus_pubkey
    customized
    delegator_shares
    details
    id
    identity
    jailed
    keybaseId
    lastUpdated
    max_change_rate
    max_rate
    min_self_delegation
    moniker
    operator_address
    profileUrl
    rate
    status
    tokens
    unbonding_height
    unbonding_time
    update_time
    uptime_percentage
    userName
    voting_power
    website
  }
`

export const AllValidators = gql`
  query AllValidators {
    allValidators {
      ...ValidatorParts
    }
  }
  ${ValidatorFragment}
`

export const ValidatorProfile = gql`
  query ValidatorInfo($address: String) {
    allValidators(where: { operator_address: { _eq: $address } }) {
      ...ValidatorParts
    }
  }
  ${ValidatorFragment}
`

export const SomeValidators = gql`
  query ValidatorInfo($addressList: [String!]) {
    allValidators(where: { operator_address: { _in: $addressList } }) {
      ...ValidatorParts
    }
  }
  ${ValidatorFragment}
`

export const Networks = gql`
  query Networks {
    networks {
      chain_id
      logo_url
      testnet
      title
    }
  }
`

// capability is 'feature_portfolio' / 'action_send'
export const NetworkCapability = (networkId, capability) => gql`
query Networks {
  networks(where: {id: {_eq: "${networkId}"}, ${capability}: {_eq: true}}) {
    id
  }
}
`

// Maintenance
export const Maintenance = gql`
query Maintenance {
  maintenance {
    message
    type
  }
}
`


export const AllValidatorsResult = data => data.allValidators
export const ValidatorResult = data => data.allValidators[0]
export const NetworkCapabilityResult = data => data.networks.length === 1
export const MaintenanceResult = data => data.maintenance
