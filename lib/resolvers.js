const { blockAdded } = require('./chain-pubsub')

function selectFrom(dataSources, networkId) {
  switch (networkId) {
    case 'cosmoshub':
      return dataSources.CosmosAPI
    case 'gaia-testnet':
      return dataSources.GaiaAPI
  }
}

async function validators(_, { networkId, addressList }, { dataSources }) {
  const validators = await selectFrom(dataSources, networkId).getAllValidators()
  if (addressList) {
    return validators.filter(
      ({ operator_address }) => addressList.indexOf(operator_address) !== -1
    )
  }
  return validators
}

function delegation(
  _,
  { networkId, delegatorAddress, validatorAddress },
  { dataSources }
) {
  return selectFrom(dataSources, networkId).getDelegationForValidator(
    delegatorAddress,
    validatorAddress
  )
}

const resolvers = {
  Query: {
    proposals: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getAllProposals(),
    proposal: (_, { networkId, id }, { dataSources }) =>
      selectFrom(dataSources, networkId).getProposalById({ proposalId: id }),
    validators,
    validator: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getValidatorByAddress({ address }),
    block: (_, { networkId, height }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      }),
    network: (_, { id }, { dataSources }) => dataSources.LunieDBAPI.getNetwork(id),
    networks: (_, __, { dataSources }) => dataSources.LunieDBAPI.getNetworks(),
    balance: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBalanceFromAddress(address),
    delegations: (_, { networkId, delegatorAddress }, { dataSources }) =>
      selectFrom(dataSources, networkId).getDelegationsForDelegatorAddress(
        delegatorAddress
      ),
    delegation
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    }
  }
}

module.exports = resolvers
