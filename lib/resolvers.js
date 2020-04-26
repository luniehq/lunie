const { keyBy } = require('lodash')
const {
  blockAdded,
  userTransactionAdded,
  userTransactionV2Added,
  event
} = require('./subscriptions')
const { encodeB32, decodeB32 } = require('./tools')
const { UserInputError, withFilter } = require('apollo-server')
const { formatBech32Reducer } = require('./reducers/livepeerV0-reducers')
const { networkList, networkMap } = require('./networks')
const { getNetworkTransactionGasEstimates } = require('../data/network-fees')
const database = require('./database')
const config = require('../config.js')
const { logOverview } = require('./statistics')
const { subscribeUser, unsubscribeUser } = require('./pushNotifications')
const {
  getDefaultTransactionSubscriptions,
  getDefaultProposalUpdateSubscriptions,
  getDefaultProposalCreationSubscriptions,
  activeNetworkValidation
} = require('./pushNotifications-format')
const BigNumber = require('bignumber.js')

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
async function getValidatorInfosMap(store) {
  const validatorInfo = await store.db.getValidatorsInfo()
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
  await localStore(dataSources, networkId).dataReady
  let validators = Object.values(localStore(dataSources, networkId).validators)
  if (activeOnly) {
    validators = validators.filter(({ status }) => status === 'ACTIVE')
  }
  const validatorInfoMap = await getValidatorInfosMap(
    localStore(dataSources, networkId)
  )
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
  await localStore(dataSources, networkId).dataReady
  const validatorInfo = await localStore(
    dataSources,
    networkId
  ).db.getValidatorInfoByAddress(operatorAddress)

  // here first we check if validators in localStore are an empty object
  // this is because sometimes it takes time to fetch them on startup
  if (Object.keys(localStore(dataSources, networkId).validators).length > 0) {
    const validator = localStore(dataSources, networkId).validators[
      operatorAddress
    ]

    if (!validator) {
      throw new UserInputError(
        `The validator ${operatorAddress} was not found within the network ${networkId}`
      )
    }

    return enrichValidator(validatorInfo, validator)
  } else {
    throw new Error(
      `Validators have not been loaded yet for the network ${networkId}`
    )
  }
}

async function delegation(
  _,
  { networkId, delegatorAddress, operatorAddress },
  { dataSources }
) {
  await localStore(dataSources, networkId).dataReady
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
  await localStore(dataSources, networkId).dataReady
  const delegations = await remoteFetch(
    dataSources,
    networkId
  ).getDelegationsForDelegatorAddress(delegatorAddress)
  const validatorInfoMap = await getValidatorInfosMap(
    localStore(dataSources, networkId)
  )

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
  await localStore(dataSources, networkId).dataReady
  const undelegations = await remoteFetch(
    dataSources,
    networkId
  ).getUndelegationsForDelegatorAddress(delegatorAddress)
  const validatorInfoMap = await getValidatorInfosMap(
    localStore(dataSources, networkId)
  )

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
      ),
    rewards: async (
      { networkId, address, fiatCurrency },
      _,
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      return remoteFetch(dataSources, networkId).getRewards(
        address,
        fiatCurrency
      )
    },
    totalRewards: async (
      { networkId, address, fiatCurrency },
      _,
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      const rewards = await remoteFetch(dataSources, networkId).getRewards(
        address,
        fiatCurrency
      )
      const stakingDenom = await remoteFetch(
        dataSources,
        networkId
      ).getStakingViewDenom()
      return rewards
        .filter(({ denom }) => denom === stakingDenom)
        .reduce((sum, { amount }) => BigNumber(sum).plus(amount), 0)
        .toFixed(6)
    }
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
  Mutation: {
    /**
     * Unsubscribe topics for user via push token
     * @param {string} token push ID
     * @param { [string] } topics topics to unsubscribe for
     */
    unsubscribeTopics: async (_, { token, topics }) => {
      const dbInstance = createDBInstance()
      const existingTopicsArray = await dbInstance.getTopicsforToken(token)
      if (existingTopicsArray.length === 0)
        throw new Error('Push token does not exist')

      // Only one topicRegistration exists per user - always first element
      const existingTopics = existingTopicsArray[0].topics.split(',')
      const unsubscribeTopics = topics.filter(
        topic => existingTopics.indexOf(topic) !== -1
      )

      if (unsubscribeTopics.length > 0) {
        await unsubscribeUser(token, unsubscribeTopics)

        const remainingTopics = existingTopics.filter(
          topic => topics.indexOf(topic) === -1
        )

        const topicRegistrationResult = await dbInstance.storePushTopics(
          {
            token,
            topics: remainingTopics
          },
          true
        )

        return {
          token,
          topics: topicRegistrationResult.data.insert_pushTopics.returning[0].topics.split(
            ','
          )
        }
      }

      return {
        token,
        topics: existingTopics
      }
    },

    /**
     * Register new device based on push ID token
     * Active networks need to be saved uniquely to identify a user with its token
     * and for easier retrieval of the token when other devices are used to log in
     * @param {string} token push ID
     * @param { [ Object] } activeNetworks all addresses associated with user account
     * @param {string} activeNetwork.address single address associated with user account
     * @param {string} activeNetwork.networkId associated networkId with address
     * @param { [string] } topics topics to unsubscribe for
     */
    registerDevice: async (_, { token, activeNetworks, topics = [] }) => {
      const pushRegistration = {
        token,
        activeNetworks,
        topics
      }
      const parsedActiveNetworks = JSON.parse(pushRegistration.activeNetworks)

      activeNetworkValidation(parsedActiveNetworks)

      if (pushRegistration.topics.length === 0) {
        const defaultSubscriptions = [
          ...getDefaultTransactionSubscriptions(parsedActiveNetworks),
          ...getDefaultProposalCreationSubscriptions(parsedActiveNetworks),
          ...getDefaultProposalUpdateSubscriptions(parsedActiveNetworks)
        ]

        pushRegistration.topics = defaultSubscriptions
      }

      try {
        await subscribeUser(pushRegistration.token, pushRegistration.topics)

        const dbInstance = createDBInstance()
        const insertRegistrations = parsedActiveNetworks.map(activeNetwork => {
          const registration = {
            token: pushRegistration.token,
            networkId: activeNetwork.networkId,
            address: activeNetwork.address
          }
          return dbInstance.storePushRegistration(registration)
        })

        const topicRegistration = dbInstance.storePushTopics({
          token: pushRegistration.token,
          topics: pushRegistration.topics
        })

        await Promise.all([...insertRegistrations, topicRegistration])
      } catch (error) {
        throw new UserInputError(
          `Incorrect input for registering device to push notifications`
        )
      }

      return pushRegistration
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
    blockV2: (_, { networkId, height }, { dataSources }, { cacheControl }) => {
      const maxAge = height ? 60 : 10
      cacheControl.setCacheHint({ maxAge })
      return remoteFetch(dataSources, networkId).getBlockByHeightV2(height)
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
    networks: (_, { experimental }) => {
      const networks = networkList
        .map(network => {
          if (network.id === 'local-cosmos-hub-testnet') {
            // HACK: network.api_url for the testnet has to be different for internal
            // (docker DNS to access the testnet container) and external (this frontend to
            // access the docker container from the outside via its port)
            return {
              ...network,
              api_url: 'http://localhost:9071'
            }
          }
          return network
        })
        // filter out not enabled networks
        .filter(network => (experimental ? true : network.enabled))
      return networks
    },
    maintenance: () => createDBInstance().getMaintenance(),
    balances: async (
      _,
      { networkId, address, fiatCurrency },
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      return remoteFetch(dataSources, networkId).getBalancesFromAddress(
        address,
        fiatCurrency
      )
    },
    balancesV2: async (
      _,
      { networkId, address, fiatCurrency },
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      return remoteFetch(dataSources, networkId).getBalancesV2FromAddress(
        address,
        fiatCurrency
      )
    },
    balance: async (
      _,
      { networkId, address, denom, fiatCurrency },
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
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
      { networkId, delegatorAddress, operatorAddress, fiatCurrency },
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      let rewards = await remoteFetch(dataSources, networkId).getRewards(
        delegatorAddress,
        fiatCurrency
      )

      // filter to a specific validator
      if (operatorAddress) {
        rewards = rewards.filter(reward => {
          // multidenom rewards
          if (reward.validator === undefined) {
            return reward.filter(
              ({ validator }) => validator.operatorAddress === operatorAddress
            )
            // non multidenom rewards
          } else {
            return reward.validator.operatorAddress === operatorAddress
          }
        })
      }
      return rewards
    },
    overview: async (
      _,
      { networkId, address, fiatCurrency },
      { dataSources, fingerprint, development }
    ) => {
      await localStore(dataSources, networkId).dataReady
      const validatorsDictionary = localStore(dataSources, networkId).validators
      const overview = await remoteFetch(dataSources, networkId).getOverview(
        address,
        validatorsDictionary,
        fiatCurrency
      )
      overview.networkId = networkId
      overview.address = address

      if (development !== 'true') {
        logOverview(overview, address, networkId, fingerprint)
      }
      return overview
    },
    transactionsV2: (_, { networkId, address, pageNumber }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getTransactionsV2(
        address,
        pageNumber
      ),
    networkFees: (_, { networkId, transactionType }) => {
      return {
        gasEstimate: getNetworkTransactionGasEstimates(
          networkId,
          transactionType
        )
      }
    },
    estimate: () => {
      try {
        const gasEstimate = 550000

        return {
          gasEstimate,
          success: true
        }
      } catch (e) {
        return {
          error: e.message,
          success: false
        }
      }
    }
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    },
    userTransactionAdded: {
      subscribe: (_, { networkId, address }) =>
        userTransactionAdded(networkId, address)
    },
    userTransactionAddedV2: {
      subscribe: (_, { networkId, address }) =>
        userTransactionV2Added(networkId, address)
    },
    event: {
      subscribe: withFilter(
        event,
        ({ event: { eventType, networkId, resourceId } }, variables) => {
          return (
            eventType === variables.eventType &&
            networkId === variables.networkId &&
            (!variables.resourceId ? true : resourceId === variables.resourceId)
          )
        }
      )
    }
  },
  // Resolve type for TransactionDetails union
  TransactionDetails: {
    __resolveType(obj) {
      return obj.type
    }
  }
}

module.exports = resolvers
