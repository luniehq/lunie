const { gql } = require('apollo-server')

const typeDefs = gql`
  enum ValidatorStatusEnum {
    ACTIVE
    INACTIVE
  }

  type Coin {
    amount: String
    denom: String
  }

  type Proposal {
    networkId: String!
    id: Int
    type: String
    title: String
    description: String
    status: String
    final_tally_yes: String
    final_tally_no: String
    final_tally_no_with_veto: String
    final_tally_abstain: String
    submit_time: String
    deposit_end_time: String
    total_deposit_denom: String
    total_deposit_amount: String
    voting_start_time: String
    voting_end_time: String
  }

  type Validator {
    networkId: String!
    operatorAddress: String
    consensusPubkey: String
    jailed: Boolean
    details: String
    website: String
    identity: String
    moniker: String
    votingPower: String # TODO tokens / total tokens
    startHeight: Int # TODO
    uptimePercentage: String
    tokens: String
    updateTime: String
    commission: String
    maxCommission: String
    maxChangeCommission: String
    commissionLastUpdate: String
    height: Int # TODO
    status: ValidatorStatusEnum
    statusDetailed: String

    # TODO
    avatarUrl: String
    customized: String
    tombstoned: Boolean
    keybaseId: String
    lastUpdated: String
    minSelfDelegation: String
    profileUrl: String
    userName: String
  }

  type Block {
    networkId: String!
    height: Int
    hash: String
    chainId: String
    time: String
    numTxs: Int
    proposer_address: String
  }

  type Network {
    id: String
    title: String
    chain_id: String
    rpc_url: String
    api_url: String
    logo_url: String
    bech32_prefix: String
    testnet: Boolean
    feature_session: Boolean
    feature_portfolio: Boolean
    feature_validators: Boolean
    feature_proposals: Boolean
    feature_activity: Boolean
    feature_explorer: Boolean
    action_send: Boolean
    action_claim_rewards: Boolean
    action_delegate: Boolean
    action_redelegate: Boolean
    action_undelegate: Boolean
    action_deposit: Boolean
    action_vote: Boolean
    action_proposal: Boolean
    experimental: Boolean
  }

  type Balance {
    denom: String!
    amount: String!
  }

  type Delegation {
    delegatorAddress: String!
    validatorAddress: String!
    shares: String!
  }

  type Subscription {
    blockAdded(networkId: String!): Block
  }

  type Query {
    block(networkId: String!, height: Int): Block
    proposal(networkId: String!, id: Int!): Proposal
    proposals(networkId: String!): [Proposal]
    validator(networkId: String!, operatorAddress: String!): Validator
    validators(networkId: String!, addressList: [String]): [Validator]
    networks: [Network]
    network(id: String): Network
    balance(networkId: String!, address: String!): Balance
    delegation(
      networkId: String!
      delegatorAddress: String!
      operatorAddress: String!
    ): Delegation
    delegations(networkId: String!, delegatorAddress: String!): [Delegation]
    bondedTokens(networkId: String!): String
    annualProvision(networkId: String!): String
    rewards(
      networkId: String!
      delegatorAddress: String
      operatorAddress: String
    ): Coin
  }
`

module.exports = typeDefs
