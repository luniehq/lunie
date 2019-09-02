/* istanbul ignore file */

import gql from "graphql-tag"

export const ValidatorProfile = gql`
  query validatorProfile($address: String) {
    validatorProfiles: validatorList(
      where: { operator_address: { _eq: $address } }
    ) {
      keybaseId
      lastUpdated
      profileUrl
      userName
      customized
      avatarUrl
    }
  }
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
export const NetworkCapabilities = id => gql`
query Networks {
  networks(where: {id: {_eq: "${id}"}}) {
    action_delegate
    action_proposal
    action_deposit
    action_vote
    action_redelegate
    action_send
    action_undelegate
    action_withdraw
    api_url
    bech32_prefix
    feature_activity
    chain_id
    feature_blocks
    feature_portfolio
    feature_proposals
    feature_sessions
    feature_validators
    logo_url
    rpc_url
    testnet
    title
  }
}
`

export const validatorProfileResultUpdate = data =>
  data.validatorProfiles ? data.validatorProfiles[0] : undefined
