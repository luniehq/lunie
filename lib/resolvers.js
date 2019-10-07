const ChainPubSub = require("./chain-pubsub");

const resolvers = {
  Query: {
    proposals: (_, __, { dataSources }) =>
      dataSources.cosmosAPI.getAllProposals(),
    proposal: (_, { id }, { dataSources }) =>
      dataSources.cosmosAPI.getProposalById({ proposalId: id }),
    validators: async (a, args, { dataSources }) => {
      const validators = await dataSources.cosmosAPI.getAllValidators()
      return validators
    },
    someValidators: async (a, args, { dataSources }) => {
      const validators = await dataSources.cosmosAPI.getAllValidators()
      return validators.filter(({ operator_address }) => args.addressList.find(operator_address))
    },
    validator: (_, { address }, { dataSources }) =>
      dataSources.cosmosAPI.getValidatorByAddress({ address }),
    block: (_, { height }, { dataSources }) =>
      dataSources.cosmosAPI.getBlockByHeight({ blockHeight: height }),
    network: (_, { id }, { dataSources }) =>
      dataSources.networkData.getNetworks().find(n => n.id === id),
    networks: (_, __, { dataSources }) => dataSources.networkData.getNetworks()
  },
  Subscription: {
    blockAdded: {
      subscribe: ChainPubSub.blockAdded
    }
  }
};

module.exports = resolvers;
