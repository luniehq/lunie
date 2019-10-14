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
      ({ operatorAddress }) => addressList.indexOf(operatorAddress) !== -1
    )
  }

  return validators
}

async function validator(_, { networkId, operatorAddress }, { dataSources }) {
  const dataSource = selectFrom(dataSources, networkId)

  const validatorInfo = await dataSource.getValidatorByAddress(operatorAddress)
  const validatorDelegations = await dataSource.getValidatorDelegations(
    operatorAddress
  )

  const selfStake = validatorDelegations.find(
    share => share.delegatorAddress === validatorInfo.address
  )

  validatorInfo.delegations = validatorDelegations
  validatorInfo.selfStake = selfStake

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
    validators,
    validator,
    block: (_, { networkId, height }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      }),
    network: (_, { id }, { dataSources }) => dataSources.networks[id],
    networks: (_, __, { dataSources }) => Object.values(dataSources.networks),
    balance: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getBalanceFromAddress(address),
    delegations: (_, { networkId, delegatorAddress }, { dataSources }) =>
      selectFrom(dataSources, networkId).getDelegationsForDelegatorAddress(
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
    transactions: (_, { networkId, address }, { dataSources }) =>
      selectFrom(dataSources, networkId).getTransactions(address)
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    }
  }
}

module.exports = resolvers
