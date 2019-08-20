import gql from "graphql-tag"

const ValidatorFragment = gql`
  fragment ValidatorParts on allValidators {
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

export const AllValidatorsResult = data => data.allValidators
export const ValidatorResult = data => data.allValidators[0]
