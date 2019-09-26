const resolvers = {
  Query: {
    proposals: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllProposals(),
    proposal: (_, { id }, { dataSources }) =>
      dataSources.cosmosAPI.getProposalById({ proposalId: id }),
    validators: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllValidators(),
    block: (_, { id }, { dataSources }) =>
      dataSources.cosmosAPI.getBlockById({ blockNumber: id })
  }
};

module.exports = resolvers;
