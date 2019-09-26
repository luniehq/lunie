const resolvers = {
  Query: {
    proposals: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllProposals(),
    proposal: (_, { id }, { dataSources }) =>
      dataSources.cosmosAPI.getProposalById({ proposalId: id }),
    validators: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllValidators()
  }
};

module.exports = resolvers;
