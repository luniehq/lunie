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

export const validatorProfileResultUpdate = data =>
  data.validatorProfiles ? data.validatorProfiles[0] : undefined

export const allProposals = gql`
  query allProposals {
    allProposals(order_by: { voting_start_time: desc }) {
      amount
      denom
      deposit_end_time
      description
      final_abstain
      final_no
      final_no_with_veto
      final_yes
      proposal_id
      proposal_status
      submit_time
      title
      type
      voting_end_time
      voting_start_time
    }
  }
`

export const allProposalsUpdate = data =>
  data.allProposals ? data.allProposals : undefined
export const AllValidatorsResult = data => data.allValidators
export const ValidatorResult = data => data.allValidators[0]
export const NetworkCapabilityResult = data => data.networks.length === 1
