const ChainPubSub = require("./chain-pubsub");

function selectFrom(dataSources, networkId) {
  switch (networkId) {
    case "cosmoshub":
      return dataSources.CosmosAPI;
    case "gaia-testnet":
      return dataSources.GaiaAPI;
  }
}

const resolvers = {
  Query: {
    proposals: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getAllProposals(),
    proposal: (_, { networkId, id }, { dataSources }) =>
      selectFrom(dataSources, networkId).getProposalById({ proposalId: id }),
    validators: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getAllValidators(),
    validator: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getValidatorByAddress({ address }),
    block: (_, { networkId, height }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      }),
    network: (_, { id }, { dataSources }) =>
      dataSources.networkData.getNetworks().find(network => network.id === id),
    networks: (_, __, { dataSources }) => dataSources.networkData.getNetworks()
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => ChainPubSub.blockAdded(networkId)
    }
  }
};

module.exports = resolvers;
