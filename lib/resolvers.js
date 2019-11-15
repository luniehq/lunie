const { keyBy } = require('lodash')
const { blockAdded, userTransactionAdded } = require('./subscriptions')
const { encodeB32, decodeB32 } = require('./tools')
const { UserInputError } = require('apollo-server')

function selectFrom(dataSources, networkId) {
  switch (networkId) {
    case 'cosmos-hub-mainnet':
      return dataSources.CosmosHubMainnetAPI
    case 'cosmos-hub-testnet':
      return dataSources.CosmosHubTestnetAPI
    case 'local-cosmos-hub-testnet':
      return dataSources.TestnetAPI
    default:
      throw new UserInputError(
        `The network with the ID '${networkId}' is not supported by the Lunie API`
      )
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
      picture: validatorInfo.picture
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
  const validator = dataSources.store[networkId].validators[operatorAddress]
  return selectFrom(dataSources, networkId).getDelegationForValidator(
    delegatorAddress,
    validator
  )
}

async function delegations(
  _,
  { networkId, delegatorAddress },
  { dataSources }
) {
  const validatorsDictionary = dataSources.store[networkId].validators
  const delegations = await selectFrom(
    dataSources,
    networkId
  ).getDelegationsForDelegatorAddress(delegatorAddress, validatorsDictionary)

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
  const validatorsDictionary = dataSources.store[networkId].validators
  const undelegations = await selectFrom(
    dataSources,
    networkId
  ).getUndelegationsForDelegatorAddress(delegatorAddress, validatorsDictionary)

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
  Proposal: {
    validator: (proposal, _, { dataSources }) => {
      //
      // Proposer value can be `unknown` (if proposal was issued in a previous chain),
      // or standard address (i.e: cosmos19wlk8gkfjckqr8d73dyp4n0f0k89q4h7xr3uwj).
      //
      // In some cases proposer address corresponds to a validator address, so we convert
      // it to an operator address. That way we can check and display if proposal comes from
      // a validator, and in that case fetch the current validator object from datasource
      // and attach it to proposal.
      //
      if (proposal.proposer !== `unknown`) {
        const proposerValAddress = encodeB32(
          decodeB32(proposal.proposer),
          `cosmosvaloper`,
          `hex`
        )
        return dataSources.store[proposal.networkId].validators[
          proposerValAddress
        ]
      } else {
        return undefined
      }
    }
  },
  Validator: {
    selfStake: (validator, _, { dataSources }) => {
      return selectFrom(dataSources, validator.networkId).getSelfStake(
        validator
      )
    }
  },
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
    network: (_, { id }, { dataSources }) => {
      const network = dataSources.store[id].network
      if (network.id === 'local-cosmos-hub-testnet') {
        // HACK: network.api_url for the testnet has to be different for internal
        // (docker DNS to access the testnet container) and external (this frontend to
        // access the docker container from the outside via it's port)
        network.api_url = 'http://localhost:9071'
      }
      return network
    },
    networks: (_, __, { dataSources }) => {
      const networks = Object.values(dataSources.store).map(({ network }) => {
        if (network.id === 'local-cosmos-hub-testnet') {
          // HACK: network.api_url for the testnet has to be different for internal
          // (docker DNS to access the testnet container) and external (this frontend to
          // access the docker container from the outside via it's port)
          network.api_url = 'http://localhost:9071'
        }
        return network
      })
      return networks
    },
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
      const validatorsDictionary = dataSources.store[networkId].validators
      let rewards = await selectFrom(dataSources, networkId).getRewards(
        delegatorAddress,
        validatorsDictionary
      )

      // filter to a specific validator
      if (operatorAddress) {
        rewards = rewards.filter(
          ({ validator }) => validator.operatorAddress === operatorAddress
        )
      }
      return rewards
    },
    overview: (_, { networkId, address }, { dataSources }) => {
      const validatorsDictionary = dataSources.store[networkId].validators
      return selectFrom(dataSources, networkId).getOverview(
        address,
        validatorsDictionary
      )
    },
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
