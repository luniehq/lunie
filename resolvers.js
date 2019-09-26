const resolvers = {
  Query: {
    proposals: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllProposals(),
    proposal: (_, { id }, { dataSources }) =>
      dataSources.cosmosAPI.getProposalById({ proposalId: id }),
    validators: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllValidators(),
    block: (_, { height }, { dataSources }) =>
      dataSources.cosmosAPI.getBlockByHeight({ blockHeight: height })
  }
};

module.exports = resolvers;
