const { keyBy } = require('lodash')
const { blockAdded, userTransactionAdded, event } = require('./subscriptions')
const { encodeB32, decodeB32 } = require('./tools')
const { UserInputError, withFilter } = require('apollo-server')
const { formatBech32Reducer } = require('./reducers/livepeerV0-reducers')
const { networkList, networkMap } = require('./networks')
const database = require('./database')
const config = require('../config.js')

function createDBInstance(network) {
  const networkSchemaName = network ? network.replace(/-/g, '_') : false
  return new database(config)(networkSchemaName)
}

function remoteFetch(dataSources, networkId) {
  if (dataSources[networkId]) {
    return dataSources[networkId].api
  } else {
    throw new UserInputError(
      `The network with the ID '${networkId}' is not supported by the Lunie API`
    )
  }
}

function localStore(dataSources, networkId) {
  if (dataSources[networkId]) {
    return dataSources[networkId].store
  } else {
    throw new UserInputError(
      `The network with the ID '${networkId}' is not supported by the Lunie API`
    )
  }
}

// TODO updating the validators with the profiles should happen already in the store so we don't query the db all the time
async function getValidatorInfosMap(networkId) {
  const validatorInfo = await createDBInstance(networkId).getValidatorsInfo()
  const validatorInfoMap = keyBy(validatorInfo, 'operator_address')
  return validatorInfoMap
}

function enrichValidator(validatorInfo, validator) {
  const picture = validatorInfo ? validatorInfo.picture : undefined
  const name =
    validatorInfo && validatorInfo.name
      ? validatorInfo.name
      : validator.name || formatBech32Reducer(validator.operatorAddress)

  return {
    ...validator,
    name,
    picture: picture === 'null' || picture === 'undefined' ? undefined : picture
  }
}

async function validators(
  _,
  { networkId, searchTerm, activeOnly },
  { dataSources }
) {
  let validators = Object.values(localStore(dataSources, networkId).validators)
  if (activeOnly) {
    validators = validators.filter(({ status }) => status === 'ACTIVE')
  }
  const validatorInfoMap = await getValidatorInfosMap(networkId)
  validators = validators.map(validator =>
    enrichValidator(validatorInfoMap[validator.operatorAddress], validator)
  )

  if (searchTerm) {
    validators = validators.filter(({ name, operatorAddress }) => {
      return (
        name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        operatorAddress.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
      )
    })
  }
  return validators
}

async function validator(_, { networkId, operatorAddress }, { dataSources }) {
  const validatorInfo = await createDBInstance(
    networkId
  ).getValidatorInfoByAddress(operatorAddress)

  const validator = localStore(dataSources, networkId).validators[
    operatorAddress
  ]

  if (!validator) {
    throw new UserInputError(
      `The validator ${operatorAddress} was was found within the network ${networkId}`
    )
  }

  return enrichValidator(validatorInfo, validator)
}

function delegation(
  _,
  { networkId, delegatorAddress, operatorAddress },
  { dataSources }
) {
  const validator = localStore(dataSources, networkId).validators[
    operatorAddress
  ]
  return remoteFetch(dataSources, networkId).getDelegationForValidator(
    delegatorAddress,
    validator
  )
}

async function delegations(
  _,
  { networkId, delegatorAddress },
  { dataSources }
) {
  const validatorsDictionary = localStore(dataSources, networkId).validators
  const delegations = await remoteFetch(
    dataSources,
    networkId
  ).getDelegationsForDelegatorAddress(delegatorAddress, validatorsDictionary)
  const validatorInfoMap = await getValidatorInfosMap(dataSources, networkId)

  return Promise.all(
    delegations.map(async delegation => ({
      ...delegation,
      validator: enrichValidator(
        validatorInfoMap[delegation.validator.operatorAddress],
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
  const validatorsDictionary = localStore(dataSources, networkId).validators
  const undelegations = await remoteFetch(
    dataSources,
    networkId
  ).getUndelegationsForDelegatorAddress(delegatorAddress, validatorsDictionary)
  const validatorInfoMap = await getValidatorInfosMap(dataSources, networkId)

  return Promise.all(
    undelegations.map(async undelegation => ({
      ...undelegation,
      validator: enrichValidator(
        validatorInfoMap[undelegation.validator.operatorAddress],
        undelegation.validator
      )
    }))
  )
}

const resolvers = {
  Overview: {
    accountInformation: (account, _, { dataSources }) =>
      remoteFetch(dataSources, account.networkId).getAccountInfo(
        account.address
      )
  },
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
        return localStore(dataSources, proposal.networkId).validators[
          proposerValAddress
        ]
      } else {
        return undefined
      }
    }
  },
  Validator: {
    expectedReturns: (validator, _, { dataSources }) => {
      return remoteFetch(dataSources, validator.networkId).getExpectedReturns(
        validator
      )
    },
    selfStake: (validator, _, { dataSources }) => {
      return remoteFetch(dataSources, validator.networkId).getSelfStake(
        validator
      )
    }
  },
  Query: {
    proposals: (_, { networkId }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getAllProposals(),
    proposal: (_, { networkId, id }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getProposalById({
        proposalId: id
      }),
    vote: (_, { networkId, proposalId, address }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getDelegatorVote({
        proposalId,
        address
      }),
    governanceParameters: (_, { networkId }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getGovernanceParameters(),
    validators,
    validator,
    block: (_, { networkId, height }, { dataSources }, { cacheControl }) => {
      const maxAge = height ? 60 : 10
      cacheControl.setCacheHint({ maxAge })
      return remoteFetch(dataSources, networkId).getBlockByHeight({
        blockHeight: height
      })
    },
    network: (_, { id }) => {
      const network = networkMap[id]
      if (network.id === 'local-cosmos-hub-testnet') {
        // HACK: network.api_url for the testnet has to be different for internal
        // (docker DNS to access the testnet container) and external (this frontend to
        // access the docker container from the outside via it's port)
        return {
          ...network,
          api_url: 'http://localhost:9071'
        }
      }
      return network
    },
    networks: () => {
      const networks = networkList.map(network => {
        if (network.id === 'local-cosmos-hub-testnet') {
          // HACK: network.api_url for the testnet has to be different for internal
          // (docker DNS to access the testnet container) and external (this frontend to
          // access the docker container from the outside via it's port)
          return {
            ...network,
            api_url: 'http://localhost:9071'
          }
        }
        return network
      })
      return networks
    },
    maintenance: () => createDBInstance().getMaintenance(),
    balances: async (
      _,
      { networkId, address, fiatCurrency },
      { dataSources }
    ) =>
      remoteFetch(dataSources, networkId).getBalancesFromAddress(
        address,
        fiatCurrency
      ),
    balance: async (
      _,
      { networkId, address, denom, fiatCurrency },
      { dataSources }
    ) => {
      const balances = await remoteFetch(
        dataSources,
        networkId
      ).getBalancesFromAddress(address, fiatCurrency)
      const balance = balances.find(balance => balance.denom === denom)
      return balance || { denom, amount: 0 }
    },
    delegations,
    undelegations,
    delegation,
    bondedTokens: (_, { networkId }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getBondedTokens(),
    annualProvision: (_, { networkId }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getAnnualProvision(),
    rewards: async (
      _,
      { networkId, delegatorAddress, operatorAddress },
      { dataSources }
    ) => {
      const validatorsDictionary = localStore(dataSources, networkId).validators
      let rewards = await remoteFetch(dataSources, networkId).getRewards(
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
    overview: async (_, { networkId, address }, { dataSources }) => {
      const validatorsDictionary = localStore(dataSources, networkId).validators
      const overview = await remoteFetch(dataSources, networkId).getOverview(
        address,
        validatorsDictionary
      )
      overview.networkId = networkId
      overview.address = address
      return overview
    },
    transactions: (_, { networkId, address }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getTransactions(address)
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    },
    userTransactionAdded: {
      subscribe: (_, { networkId, address }) =>
        userTransactionAdded(networkId, address)
    },
    event: {
      subscribe: withFilter(
        event,
        ({ event: { eventType, networkId, ressourceId } }, variables) => {
          return (
            eventType === variables.eventType &&
            networkId === variables.networkId &&
            (!variables.ressourceId
              ? true
              : ressourceId === variables.ressourceId)
          )
        }
      )
    }
  }
}

module.exports = resolvers
