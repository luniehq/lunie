const { gql } = require("apollo-server");

const typeDefs = gql`
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

  type Subscription {
    blockAdded(networkId: String!): Block
  }

  type Query {
    block(networkId: String!, height: Int): Block
    proposal(networkId: String!, id: Int!): Proposal
    proposals(networkId: String!): [Proposal]
    validator(networkId: String!, address: String!): Validator
    validators(networkId: String!): [Validator]
    networks: [Network]
    network(id: String): Network
  }
`;

module.exports = typeDefs;
