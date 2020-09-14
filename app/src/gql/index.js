/* istanbul ignore file */

import gql from "graphql-tag"
import store from "../vuex/store"

function getCurrentNetwork() {
  return store().state.connection.network
}

export const schemaMap = {
  cosmoshub: "",
  [`gaia-testnet`]: "gaia_testnet_",
  testnet: "gaia_testnet_",
}

export const ValidatorFragment = `
  id
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
`

export const AllValidators = () => {
  const currentNetwork = getCurrentNetwork()
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

export const DelegatorValidators = (schema) => gql`
  query ValidatorInfo($delegatorAddress: String!) {
    validators(networkId: "${schema}", delegatorAddress: $delegatorAddress) {
      ${ValidatorFragment}
    }
  }
`

export const DelegationsForDelegator = (schema) => gql`
  query delegations($delegatorAddress: String!) {
    delegations(networkId: "${schema}", delegatorAddress: $delegatorAddress) {
      id
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
      icon
      slug
      powered {
        name
        providerAddress
        picture
      }
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
      lockUpPeriod
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
      bech32_prefix
      ledger_app
      testnet
      enabled
      coinLookup {
        chainDenom
        viewDenom
        chainToViewConversionFactor
        icon
      }
      rpc_url
      HDPaths
      curves
      defaultHDPath
      defaultCurve
    }
  }
`

export const NetworksResult = (data) => data.networks

export const ProposalFragment = `
  id
  proposalId
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
  proposer {
    name
    address
    picture
  }
  validator {
    id
    name
    details
    identity
    picture
  }
  beneficiary {
    name
    address
    picture
  }
  summary
  detailedVotes {
    deposits {
      amount {
        amount
        denom
      }
      depositer {
        name
        address
        picture
      }
    }
    depositsSum
    percentageDepositsNeeded
    votes {
      id
      voter {
        name
        address
        picture
      }
      option
      amount {
        amount
        denom
      }
    }
    votesSum
    votingThresholdYes
    votingThresholdNo
    votingPercentageYes
    votingPercentageNo
    links {
      title
      link
      type
    }
    timeline {
      title 
      time
    }
  }
`

export const ProposalItem = (schema) => gql`
  query proposal($id: String!) {
    proposal(networkId: "${schema}", id: $id) {
      ${ProposalFragment}
    }
  }
`

export const GovernanceParameters = (schema) => gql`
query governanceParameters {
  governanceParameters(networkId: "${schema}") {
    depositDenom
    votingThreshold
    vetoThreshold
    depositThreshold
  }
}
`

export const Vote = (schema) => gql`
query vote($proposalId: String!, $address: String!) {
  vote(networkId: "${schema}", proposalId: $proposalId, address: $address) {
    option
  }
}
`

export const Block = (networkId) => gql`
query Block {
  block(networkId: "${networkId}") {
    id
    height
    chainId
  }
}
`

export const MetaData = (schema) => gql`
query metaData {
  metaData(networkId: "${schema}") {
    stakingDenom
  }
}
`

export const UserTransactionAdded = gql`
  subscription($networkId: String!, $address: String!) {
    userTransactionAddedV2(networkId: $networkId, address: $address) {
      hash
      height
      success
      log
    }
  }
`

export const NotificationAdded = gql`
  subscription($addressObjects: [NotificationInput]!) {
    notificationAdded(addressObjects: $addressObjects) {
      networkId
      timestamp
      title
      link
      icon
    }
  }
`

export const AddressRole = gql`
  query($networkId: String!, $address: String!) {
    accountRole(networkId: $networkId, address: $address)
  }
`
