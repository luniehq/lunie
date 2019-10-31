/* istanbul ignore file */

import gql from "graphql-tag"
import store from "../vuex/store"

function getCurrentNetwork() {
  // console.log(store())
  return store().state.connection.network
}

export const schemaMap = {
  cosmoshub: "",
  [`gaia-testnet`]: "gaia_testnet_",
  testnet: "gaia_testnet_"
}

const ValidatorFragment = `
  name
  operatorAddress
  consensusPubkey
  jailed
  picture
  details
  website
  identity
  votingPower
  startHeight
  uptimePercentage
  tokens
  commissionUpdateTime
  commission
  maxCommission
  maxChangeCommission
  status
  statusDetailed
  expectedReturns
  selfStake
  delegatorDelegation
`

export const AllValidators = () => {
  const currentNetwork = getCurrentNetwork()
  // console.log(`currentNetwork`, currentNetwork)
  return gql`
    query AllValidators {
      validators(networkId: "${currentNetwork}") {
        ${ValidatorFragment}
      }
    }`
}

export const ValidatorProfile = gql`
  query validator($networkId: String!, $operatorAddress: String!) {
    validator(networkId: $networkId, operatorAddress: $operatorAddress) {
      ${ValidatorFragment}
    }
  }
`

export const DelegatorValidators = schema => gql`
  query ValidatorInfo($delegatorAddress: String!) {
    validators(networkId: "${schema}", delegatorAddress: $delegatorAddress) {
      ${ValidatorFragment}
    }
  }
`

export const UndelegationsForDelegator = schema => gql`
  query Undelegations($delegatorAddress: String!) {
    undelegations(networkId: "${schema}", delegatorAddress: $delegatorAddress) {
      validator {
        ${ValidatorFragment}
      }
      amount
      startHeight
      endTime
    }
  }
`

export const DelegationsForDelegator = schema => gql`
  query Delegations($delegatorAddress: String!) {
    delegations(networkId: "${schema}", delegatorAddress: $delegatorAddress) {
      validator {
        ${ValidatorFragment}
      }
      amount
    }
  }
`

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
    stakingDenom
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

export const Block = networkId => gql`
query Block {
  block(networkId: "${networkId}") {
    height
    chainId
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

export const UserTransactionAdded = gql`
  subscription($networkId: String!, $address: String!) {
    userTransactionAdded(networkId: $networkId, address: $address) {
      hash
      height
      success
      log
    }
  }
`
