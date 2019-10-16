/* istanbul ignore file */

import gql from "graphql-tag"

export const schemaMap = {
  cosmoshub: "",
  [`gaia-testnet`]: "gaia_testnet_",
  testnet: ""
}

const ValidatorFragment = `
  networkId
  operatorAddress
  consensusPubkey
  jailed
  details
  website
  identity
  moniker
  votingPower
  startHeight
  uptimePercentage
  tokens
  updateTime
  commission
  maxCommission
  maxChangeCommission
  commissionLastUpdate
  height
  status
  statusDetailed
  delegations
  selfStake
  delegatorShares

  avatarUrl
  customized
  tombstoned
  keybaseId
  lastUpdated
  minSelfDelegation
  profileUrl
  userName
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
    validators(networkId: "${schema}", addressList: $addressList) {
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
  creationTime
  status
  statusBeginTime
  statusEndTime
  tally {
    yes
    no
    veto
    abstain
    total
    totalVotedPercentage
  }
  deposit
`

export const ProposalList = schema => gql`
  query proposals {
    proposals(networkId: "${schema}") {
      ${ProposalFragment}
    }
  }
`

export const ProposalItem = schema => gql`
  query proposal($id: Int!) {
    proposal(networkId: "${schema}", id: $id) {
      ${ProposalFragment}
    }
  }
`

export const GovernanceParameters = schema => gql`
query governanceParameters {
  governanceParameters(networkId: "${schema}") {
    depositDenom
    votingThreshold
    vetoThreshold
    depositThreshold
  }
}
`

export const Vote = schema => gql`
query vote($proposalId: Int!, $address: String!) {
  vote(networkId: "${schema}", proposalId: $proposalId, address: $address) {
    option
  }
}
`

export const Balances = schema => gql`
query balances($address: String!) {
  balance(networkId: "${schema}", address: $address) {
    denom
    amount
  }
}
`

export const Overview = schema => gql`
query overview($address: String!) {
  overview(networkId: "${schema}", address: $address) {
    totalRewards
    liquidStake
    totalStake
  }
}
`

export const MetaData = schema => gql`
query metaData {
  metaData(networkId: "${schema}") {
    stakingDenom
  }
}
`

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