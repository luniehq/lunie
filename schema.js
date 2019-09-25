const { gql } = require("apollo-server")

const typeDefs = gql`
  type Proposal {
    id: Int,
    type: String,
    title: String,
    description: String,
    status: String,
    final_tally_yes: String,
    final_tally_no: String,
    final_tally_no_with_veto: String,
    final_tally_abstain: String,
  }

  type Query {
    proposal(id: Int!): Proposal
    proposals: [Proposal]
  }
`

module.exports = typeDefs