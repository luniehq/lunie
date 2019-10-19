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
  votingPower
  startHeight
  uptimePercentage
  tokens
  updateTime
  commission
  maxCommission
  maxChangeCommission
  status
  statusDetailed
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

export const Block = networkId => gql`
query Block {
  block(networkId: "${networkId}") {
    height
    chainId
  }
}
`

export const NewBlockSubscription = networkId => gql`
  subscription {
    blockAdded(networkId: "${networkId}") {
      height
      hash
      chainId
      time
      numTxs
    }
  }
`
