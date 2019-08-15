import gql from "graphql-tag"

export const ValidatorProfile = gql`
  query ValidatorInfo($address: String) {
    allValidators(where: { operator_address: { _eq: $address } }) {
      keybaseId
      avatarUrl
      userName
      profileUrl
      customized
      operator_address
      consensus_pubkey
      jailed
      status
      tokens
      delegator_shares
      unbonding_height
      unbonding_time
      min_self_delegation
      details
      identity
      moniker
      website
      rate
      max_rate
      max_change_rate
      update_time
      lastUpdated
    }
  }
`

export const ValidatorResult = data => {
  console.log(data)
  return data.allValidators[0]
}
