const resolvers = {
  Query: {
    proposals: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllProposals(),
    proposal: (_, { id }, { dataSources }) =>
      dataSources.cosmosAPI.getProposalById({ proposalId: id }),
    validators: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllValidators(),
    validator: (_, { address }, { dataSources }) =>
      dataSources.cosmosAPI.getValidatorByAddress({ address }),
    block: (_, { height }, { dataSources }) =>
      dataSources.cosmosAPI.getBlockByHeight({ blockHeight: height }),
    networks: (_, __, { dataSources }) => dataSources.networkData.getNetworks()
  }
};

module.exports = resolvers;
