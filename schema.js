const { gql } = require("apollo-server");

const typeDefs = gql`
  type Proposal {
    id: Int
    type: String
    title: String
    description: String
    status: String
    final_tally_yes: String
    final_tally_no: String
    final_tally_no_with_veto: String
    final_tally_abstain: String
  }

  type Validator {
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
  }

  type Query {
    proposal(id: Int!): Proposal
    proposals: [Proposal]
    validators: [Validator]
  }
`;

module.exports = typeDefs;
