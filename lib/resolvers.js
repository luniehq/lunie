const { blockAdded, userTransactionAdded } = require('./chain-pubsub')

function selectFrom(dataSources, networkId) {
  switch (networkId) {
    case 'cosmos-hub-mainnet':
      return dataSources.CosmosHubMainnetAPI
    case 'cosmos-hub-testnet':
      return dataSources.CosmosHubTestnetAPI
    case 'local-cosmos-hub-testnet':
      return dataSources.TestnetAPI
  }
}

async function enrichValidator(dataSources, networkId, validator) {
  const validatorInfo = (await dataSources.LunieDBAPI.getValidatorInfoByAddress(
    validator.operatorAddress,
    networkId
  )).shift()
  if (
    validator &&
    validatorInfo &&
    validator.operatorAddress == validatorInfo.operator_address
  ) {
    return {
      ...validator,
      picture: validatorInfo.picture,
      name: validatorInfo.name
    }
  }

  return validator
}

async function validators(_, { networkId, all, query }, { dataSources }) {
  let validators = await selectFrom(dataSources, networkId).getAllValidators()
  if (!all) {
    validators = validators.filter(({ status }) => status === 'ACTIVE')
  }
  if (query) {
    validators = validators.filter(({ name, operatorAddress }) => {
      return name.indexOf(query) !== -1 || operatorAddress.indexOf(query)
    })
  }

  return Promise.all(
    validators.map(validator =>
      enrichValidator(dataSources, networkId, validator)
    )
  )
}

async function validator(_, { networkId, operatorAddress }, { dataSources }) {
  const dataSource = selectFrom(dataSources, networkId)
  const validator = await dataSource.getValidatorByAddress(operatorAddress)

  return enrichValidator(dataSources, networkId, validator)
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

async function delegations(
  _,
  { networkId, delegatorAddress },
  { dataSources }
) {
  const delegations = await selectFrom(
    dataSources,
    networkId
  ).getDelegationsForDelegatorAddress(delegatorAddress)

  return Promise.all(
    delegations.map(async delegation => ({
      ...delegation,
      validator: await enrichValidator(
        dataSources,
        networkId,
        delegation.validator
      )
    }))
  )
}

async function undelegations(
  _,
  { networkId, delegatorAddress },
  { dataSources }
) {
  const undelegations = await selectFrom(
    dataSources,
    networkId
  ).getUndelegationsForDelegatorAddress(delegatorAddress)

  return Promise.all(
    undelegations.map(async undelegation => ({
      ...undelegation,
      validator: await enrichValidator(
        dataSources,
        networkId,
        undelegation.validator
      )
    }))
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
    delegations,
    undelegations,
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
      let rewards = await selectFrom(dataSources, networkId).getRewards(
        delegatorAddress
      )

      // filter to a specific validator
      if (operatorAddress) {
        rewards = rewards.filter(
          ({ validator }) => validator.operatorAddress === operatorAddress
        )
      }
      return rewards
    },
    overview: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getOverview(address),
    transactions: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getTransactions(address)
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    },
    userTransactionAdded: {
      subscribe: (_, { networkId, address }) =>
        userTransactionAdded(networkId, address)
    }
  }
}

module.exports = resolvers
