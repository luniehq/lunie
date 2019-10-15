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
  const response = await dataSources.LunieDBAPI.getValidatorsInfo(networkId);
  return validators.map(validator => {
    const validatorDBData = response.find(dbdata => dbdata.operator_address == validator.operatorAddress)
    if(validatorDBData){
      validator.picture = validatorDBData.picture;
      validator.name = validatorDBData.name;
    }
    return validator;
  })
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

async function validator( _, { networkId, address }, { dataSources }){
  const validator = await selectFrom(dataSources, networkId).getValidatorByAddress({ address });
  const response = (await dataSources.LunieDBAPI.getValidatorInfoByAddress(address, networkId)).shift();
  if(validator && response && validator.operatorAddress == response.operator_address){
    validator.picture = response.picture;
    validator.name = response.name;
  }
  return validator;
}

const resolvers = {
  Query: {
    proposals: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getAllProposals(),
    proposal: (_, { networkId, id }, { dataSources }) =>
      selectFrom(dataSources, networkId).getProposalById({ proposalId: id }),
    validators,
    validator,
    block: (_, { networkId, height }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      }),
    network: (_, { id }, { dataSources }) => dataSources.LunieDBAPI.getNetwork(id),
    networks: (_, __, { dataSources }) => dataSources.LunieDBAPI.getNetworks(),
    maintenance: (_, __, { dataSources }) => dataSources.LunieDBAPI.getMaintenance(),
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