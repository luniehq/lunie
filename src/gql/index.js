/* istanbul ignore file */

import gql from "graphql-tag"

export const schemaMap = {
  cosmoshub: "",
  [`gaia-testnet`]: "gaia_testnet_",
  testnet: ""
}

const ValidatorFragment = `
    avatarUrl
    consensus_pubkey
    customized
    delegator_shares
    details
    identity
    jailed
    tombstoned
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
`

export const AllValidators = schema => gql`
  query validators {
    ${schemaMap[schema]}validators {
      ${ValidatorFragment}
    }
  }
`

export const ValidatorProfile = schema => gql`
  query validator($address: String) {
    ${schemaMap[schema]}validator(address: $address) {
      ${ValidatorFragment}
    }
  }
`

export const SomeValidators = schema => gql`
  query ValidatorInfo($addressList: [String!]) {
    ${schemaMap[schema]}validators(where: { operator_address: { _in: $addressList } }) {
      ${ValidatorFragment}
    }
  }
`

export const ValidatorByName = schema => active => gql`
  query ${schemaMap[schema]}ValidatorInfo($monikerName: String) {
    ${schemaMap[schema]}validators(
      where: {
        moniker: { _ilike: $monikerName }
        ${active ? "jailed: { _neq: true }" : ""}
        ${active ? "status: { _neq: 0 }" : ""}
      }
    ) {
      ${ValidatorFragment}
    }
  }
`

export const validatorsResult = schema => data =>
  data[`${schemaMap[schema]}validators`]

export const ValidatorResult = schema => data => {
  console.log(data)
  return data[`${schemaMap[schema]}validator`]
}

export const Networks = gql`
  query Networks {
    networks {
      id
      chain_id
      logo_url
      testnet
      title
      rpc_url
    }
  }
`

// capability is 'feature_portfolio' / 'action_send'
export const NetworkCapability = networkId => gql`
query Networks {
  network(id: "${networkId}") {
    id
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
  }
}
`

export const NetworkCapabilityResult = action => data => data.network[action]
export const NetworksResult = data => data.networks

const ProposalFragment = `
  id
  type
  title
  description
  status
  final_tally_yes
  final_tally_no
  final_tally_no_with_veto
  final_tally_abstain
  submit_time
  deposit_end_time
  total_deposit_denom
  total_deposit_amount
  voting_start_time
  voting_end_time  
`

export const ProposalList = schema => gql`
  query proposals {
    ${schemaMap[schema]}proposals {
      ${ProposalFragment}
    }
  }
`

export const ProposalItem = schema => gql`
  query proposal($id: Int!) {
    ${schemaMap[schema]}proposal(id: $id) {
      ${ProposalFragment}
    }
  }
`

export const proposalListResult = schema => data => {
  console.log(data)
  return data[`${schemaMap[schema]}proposals`]
}

export const proposalResult = schema => data => {
  console.log(data)
  return data[`${schemaMap[schema]}proposal`]
}

export const NewBlockSubscription = () => gql`
  subscription {
    blockAdded {
      height
      hash
      chainId
      time
      numTxs
    }
  }
`
