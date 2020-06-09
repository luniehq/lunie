const { keyBy } = require('lodash')
const {
  blockAdded,
  notificationAdded,
  userTransactionAdded,
  userTransactionV2Added,
  event
} = require('./subscriptions')
const { encodeB32, decodeB32 } = require('./tools')
const { UserInputError, withFilter } = require('apollo-server')
const { formatBech32Reducer } = require('./reducers/livepeerV0-reducers')
const { networkList, networkMap } = require('./networks')
const {
  getNetworkTransactionGasEstimates,
  getPolkadotFee,
  getCosmosFee
} = require('../data/network-fees')
const database = require('./database')
const { getNotifications } = require('./notifications')
const config = require('../config.js')
const { logOverview } = require('./statistics')
const BigNumber = require('bignumber.js')
const networks = require('../data/networks')

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

async function addPopularityToValidators(validators, dataSources, networkId) {
  return Promise.all(
    validators.map(async (validator) => {
      // popularity is actually the number of views of a validator on their page
      const popularity = await localStore(
        dataSources,
        networkId
      ).db.getValidatorViews(validator.operatorAddress, networkId)
      // we add the popularity field to the validator
      return {
        ...validator,
        popularity: popularity || 0
      }
    })
  )
}

async function validators(
  _,
  { networkId, searchTerm, activeOnly, popularSort },
  { dataSources }
) {
  await localStore(dataSources, networkId).dataReady
  let validators = Object.values(localStore(dataSources, networkId).validators)
  validators = await addPopularityToValidators(
    validators,
    dataSources,
    networkId
  )
  function compare(a, b) {
    let comparison = 0
    if (a.popularity < b.popularity) {
      comparison = 1
    } else if (a.popularity > b.popularity) {
      comparison = -1
    }
    return comparison
  }
  // we always sort validators by popularity
  validators.sort(compare)
  if (activeOnly) {
    validators = validators.filter(({ status }) => status === 'ACTIVE')
  }
  const validatorInfoMap = await getValidatorInfosMap(
    localStore(dataSources, networkId)
  )
  validators = validators.map((validator) =>
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
  // if popularSort is true then we filter out validators with no picture
  if (popularSort) {
    return validators.filter(({ picture }) => picture)
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

    localStore(dataSources, networkId).db.incrementValidatorViews(
      operatorAddress,
      networkId
    )

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
    delegations.map(async (delegation) => ({
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
    undelegations.map(async (undelegation) => ({
      ...undelegation,
      validator: enrichValidator(
        validatorInfoMap[undelegation.validator.operatorAddress],
        undelegation.validator
      )
    }))
  )
}

const networkFees = async (
  _,
  { networkId, senderAddress, messageType, message, memo },
  { dataSources }
) => {
  if (!senderAddress) return // fixes weird error of 'startWith of undefined'
  const networkObject = networks.find(({ id }) => id === networkId)
  const networkSource = remoteFetch(dataSources, networkObject.id)
  const gasEstimate = getNetworkTransactionGasEstimates(networkId, messageType)

  // if transaction is within Polkadot, return polkadotFee
  if (networkObject.network_type === 'polkadot') {
    const transactionFee = await getPolkadotFee({
      networkSource,
      network: networkObject,
      senderAddress,
      messageType,
      message,
      memo
    })
    return {
      gasEstimate,
      transactionFee,
      fee: transactionFee
    }
  }
  if (networkObject.network_type === 'cosmos') {
    const cosmosFee = await getCosmosFee(
      networkObject,
      networkSource,
      senderAddress,
      messageType,
      message,
      gasEstimate
    )
    return {
      gasEstimate,
      transactionFee: cosmosFee.transactionFee,
      fee: cosmosFee.transactionFee, // DEPRECATE
      chainAppliedFees: cosmosFee.chainAppliedFees // DEPRECATE
    }
  }
}

const transactionMetadata = async (
  _,
  { networkId, transactionType, address },
  { dataSources }
) => {
  const thisNetworkFees = await networkFees(_, { networkId, transactionType })
  const accountDetails = await remoteFetch(
    dataSources,
    networkId
  ).getAccountInfo(address, networkId)
  return {
    gasEstimate: thisNetworkFees.gasEstimate,
    gasPrices: thisNetworkFees.gasPrices,
    chainAppliedFees: thisNetworkFees.chainAppliedFees,
    accountSequence: accountDetails.sequence,
    accountNumber: accountDetails.accountNumber
  }
}

const resolvers = {
  Overview: {
    accountInformation: (account, _, { dataSources }) =>
      remoteFetch(dataSources, account.networkId).getAccountInfo(
        account.address,
        account.networkId
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
    allDelegators: async (_, { networkId }, { dataSources }) => {
      await localStore(dataSources, networkId).dataReady
      return remoteFetch(dataSources, networkId).getAllDelegators()
    },
    blockV2: (_, { networkId, height }, { dataSources }, { cacheControl }) => {
      const maxAge = height ? 60 : 10
      cacheControl.setCacheHint({ maxAge })
      return remoteFetch(dataSources, networkId).getBlockV2(height)
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
        .map((network) => {
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
        .filter((network) => (experimental ? true : network.enabled))
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
      const balance = balances.find((balance) => balance.denom === denom)
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
        rewards = rewards.filter((reward) => {
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
    networkFees,
    transactionMetadata,
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
    },
    notifications: getNotifications,
    accountRole: async (_, { networkId, address }, { dataSources }) => {
      await localStore(dataSources, networkId).dataReady
      if (!remoteFetch(dataSources, networkId).getAddressRole) return undefined

      return await remoteFetch(dataSources, networkId).getAddressRole(address)
    }
  },
  Subscription: {
    blockAdded: {
      subscribe: (_, { networkId }) => blockAdded(networkId)
    },
    notificationAdded: {
      subscribe: (_, { addressObjects }, { dataSources }) =>
        notificationAdded(addressObjects, dataSources())
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
