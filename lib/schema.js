const { gql } = require('apollo-server')
const typeDefs = gql`
  type Tally {
    yes: String # BigNumber
    no: String # BigNumber
    abstain: String # BigNumber
    veto: String # BigNumber
    total: String # BigNumber
  }

  type Proposal {
    networkId: String!
    id: Int
    type: String
    title: String
    description: String
    status: String
    creationTime: String
    statusBeginTime: String
    statusEndTime: String
    tally: Tally
    deposit: String # BigNumber
  }

  type Validator {
    networkId: String!
    operator_address: String
    consensus_pubkey: String
    jailed: Boolean
    status: Int
    tokens: String
    delegator_shares: String
    moniker: String
    identity: String
    website: String
    details: String
    bond_height: Int
    bond_intra_tx_counter: Int
    unbonding_height: Int
    unbonding_time: String
    rate: Int
    max_rate: Int
    max_change_rate: Int
    update_time: String
    # TODO
    avatarUrl: String
    customized: String
    tombstoned: Boolean
    keybaseId: String
    lastUpdated: String
    min_self_delegation: String
    profileUrl: String
    uptime_percentage: String
    userName: String
    voting_power: String
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

  type GovernanceParameters {
    votingThreshold: Float
    vetoThreshold: Float
    depositThreshold: String # BigNumber
  }

  type Subscription {
    blockAdded(networkId: String!): Block
  }

  type Query {
    block(networkId: String!, height: Int): Block
    proposal(networkId: String!, id: Int!): Proposal
    proposals(networkId: String!): [Proposal]
    governanceParameters(networkId: String!): GovernanceParameters
    validator(networkId: String!, address: String!): Validator
    validators(networkId: String!, addressList: [String]): [Validator]
    networks: [Network]
    network(id: String): Network
    balance(networkId: String!, address: String!): Balance
    delegation(
      networkId: String!
      delegatorAddress: String!
      validatorAddress: String!
    ): Delegation
    delegations(networkId: String!, delegatorAddress: String!): [Delegation]
  }
`

module.exports = typeDefs
