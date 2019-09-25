const resolvers = {
  Query: {
    proposals: (_, __, { dataSources }) =>
      dataSources.proposalAPI.getAllProposals(),
    proposal: (_, { id }, { dataSources }) =>
      dataSources.proposalAPI.getProposalById({ proposalId: id })
  }
}

module.exports = resolvers
