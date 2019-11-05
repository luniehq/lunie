const { keyBy } = require('lodash')
const { blockAdded, userTransactionAdded } = require('./subscriptions')

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
    }
  }

  return validator
}

async function validators(
  _,
  { networkId, searchTerm, activeOnly },
  { dataSources }
) {
  let validators = Object.values(dataSources.store[networkId].validators)
  if (activeOnly) {
    validators = validators.filter(({ status }) => status === 'ACTIVE')
  }
  if (searchTerm) {
    validators = validators.filter(({ name, operatorAddress }) => {
      return (
        name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        operatorAddress.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
      )
    })
  }

  const validatorInfo = await dataSources.LunieDBAPI.getValidatorsInfo(
    networkId
  )
  const validatorInfoMap = keyBy(validatorInfo, 'operator_address')

  return validators.map(validator => {
    const validatorProfile = validatorInfoMap[validator.operatorAddress]
    if (validatorProfile && validatorProfile.picture) {
      validator.picture = validatorProfile.picture
    } else {
      validator.picture = ''
    }
    return validator
  })
}

async function validator(_, { networkId, operatorAddress }, { dataSources }) {
  const validator = dataSources.store[networkId].validators[operatorAddress]
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
    block: (_, { networkId, height }, { dataSources }, { cacheControl }) => {
      const maxAge = height ? 60 : 10
      cacheControl.setCacheHint({ maxAge })
      return selectFrom(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      })
    },
    network: (_, { id }, { dataSources }) =>
      dataSources.LunieDBAPI.getNetwork(id),
    networks: (_, __, { dataSources }) => dataSources.LunieDBAPI.getNetworks(),
    maintenance: (_, __, { dataSources }) =>
      dataSources.LunieDBAPI.getMaintenance(),
    balances: async (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBalancesFromAddress(address),
    balance: async (_, { networkId, address, denom }, { dataSources }) => {
      const balances = await selectFrom(
        dataSources,
        networkId
      ).getBalancesFromAddress(address)
      const balance = balances.find(balance => balance.denom === denom)
      return balance || { denom, amount: 0 }
    },
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
