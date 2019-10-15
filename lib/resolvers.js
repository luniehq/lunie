const { blockAdded } = require('./chain-pubsub')

function selectFrom(dataSources, networkId) {
  switch (networkId) {
    case 'cosmoshub':
      return dataSources.CosmosAPI
    case 'gaia-testnet':
      return dataSources.GaiaAPI
    case 'testnet':
      return dataSources.TestnetAPI
  }
}

async function validators(_, { networkId, addressList }, { dataSources }) {
  const validators = await selectFrom(dataSources, networkId).getAllValidators()
  if (addressList) {
    return validators.filter(
      ({ operatorAddress }) => addressList.indexOf(operatorAddress) !== -1
    )
  }
  const response = await dataSources.LunieDBAPI.getValidatorsInfo(networkId)
  return validators.map(validator => {
    const validatorDBData = response.find(
      dbdata => dbdata.operator_address == validator.operatorAddress
    )
    if (validatorDBData) {
      validator.picture = validatorDBData.picture
      validator.name = validatorDBData.name
    }
    return validator
  })
}

async function validator(_, { networkId, operatorAddress }, { dataSources }) {
  const dataSource = selectFrom(dataSources, networkId)

  const validator = await dataSource.getValidatorByAddress(operatorAddress)
  const validatorDelegations = await dataSource.getValidatorDelegations(
    operatorAddress
  )

  const selfStake = validatorDelegations.find(
    share => share.delegatorAddress === validator.address
  )

  validator.delegations = validatorDelegations
  validator.selfStake = selfStake

  const validatorInfo = (await dataSources.LunieDBAPI.getValidatorInfoByAddress(
    operatorAddress,
    networkId
  )).shift()
  if (
    validator &&
    validatorInfo &&
    validator.operatorAddress == validatorInfo.operator_address
  ) {
    validator.picture = validatorInfo.picture
    validator.name = validatorInfo.name
  }

  return validatorInfo
}

function delegation(
  _,
  { networkId, delegatorAddress, operatorAddress },
  { dataSources }
) {
  return selectFrom(dataSources, networkId).getDelegationForValidator(
    delegatorAddress,
    operatorAddress
  )
}

const resolvers = {
  Query: {
    proposals: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getAllProposals(),
    proposal: (_, { networkId, id }, { dataSources }) =>
      selectFrom(dataSources, networkId).getProposalById({ proposalId: id }),
    vote: (_, { networkId, proposalId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getDelegatorVote({
        proposalId,
        address
      }),
    governanceParameters: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getGovernanceParameters(),
    validators,
    validator,
    block: (_, { networkId, height }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      }),
    network: (_, { id }, { dataSources }) =>
      dataSources.LunieDBAPI.getNetwork(id),
    networks: (_, __, { dataSources }) => dataSources.LunieDBAPI.getNetworks(),
    maintenance: (_, __, { dataSources }) =>
      dataSources.LunieDBAPI.getMaintenance(),
    balance: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBalanceFromAddress(address),
    delegations: (_, { networkId, delegatorAddress }, { dataSources }) =>
      selectFrom(dataSources, networkId).getDelegationsForDelegatorAddress(
        delegatorAddress
      ),
    undelegations: (_, { networkId, delegatorAddress }, { dataSources }) =>
      selectFrom(dataSources, networkId).getUndelegationsForDelegatorAddress(
        delegatorAddress
      ),
    delegation,
    bondedTokens: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBondedTokens(),
    annualProvision: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getAnnualProvision(),
    rewards: async (
      _,
      { networkId, delegatorAddress, operatorAddress },
      { dataSources }
    ) => {
      if (!delegatorAddress && !operatorAddress) {
        throw new Error(
          'Must supply atleast one of delegatorAddress or operatorAddress'
        )
      }

      const result = await selectFrom(dataSources, networkId).getRewards(
        delegatorAddress,
        operatorAddress
      )
      console.log(result)
      return result
    },
    overview: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getOverview(address),
    metaData: (_, { networkId }, { dataSources }) =>
      selectFrom(dataSources, networkId).getMetaData()
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    }
  }
}

module.exports = resolvers
