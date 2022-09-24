const { sortBy, keyBy } = require('lodash')
const { UserInputError, withFilter } = require('apollo-server')
const {
  blockAdded,
  notificationAdded,
  userTransactionAdded,
  userTransactionV2Added,
  event
} = require('./subscriptions')
const {
  getNetworkTransactionGasEstimates,
  getPolkadotFee,
  getCosmosFee
} = require('../data/network-fees')
const database = require('./database')
const { getNotifications } = require('./notifications/notifications')
const config = require('../config.js')
const { logRewards, logBalances } = require('./statistics')
const { registerUser } = require('./accounts')
const { getValidatorProfile, getValidatorFeed } = require('./reducers/common')
const FiatValuesAPI = require('./fiatvalues-api')

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

async function validators(
  _,
  { networkId, searchTerm, activeOnly, popularSort, fiatCurrency },
  { dataSources }
) {
  await localStore(dataSources, networkId).dataReady
  let validators = []
  const dataSource = remoteFetch(dataSources, networkId)
  if (fiatCurrency) {
    validators = dataSource.getValidators(dataSource.blockHeight, fiatCurrency)
  } else {
    validators = Object.values(localStore(dataSources, networkId).validators)
  }
  if (activeOnly) {
    validators = validators.filter(({ status }) => status === 'ACTIVE')
  }
  // if popularSort is true then we filter out validators with no picture
  if (popularSort) {
    validators = validators.filter(({ picture }) => picture)
    validators = sortBy(validators, 'popularity')
  }
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
  return localStore(dataSources, networkId).validators[operatorAddress]
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

  return delegations
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
  return undelegations
}

const networkFees = (networks) => async (
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
  { networkId, address },
  { dataSources }
) => {
  const accountDetails = await remoteFetch(
    dataSources,
    networkId
  ).getAccountInfo(address)
  return {
    accountSequence: accountDetails.sequence,
    accountNumber: accountDetails.accountNumber
  }
}

const governanceOverview = () => async (_, { networkId }, { dataSources }) => {
  const overview = await remoteFetch(
    dataSources,
    networkId
  ).getGovernanceOverview()
  return {
    totalStakedAssets: overview.totalStakedAssets,
    totalVoters: overview.totalVoters,
    treasurySize: overview.treasurySize,
    recentProposals: overview.recentProposals,
    topVoters: overview.topVoters,
    links: overview.links
  }
}

const resolvers = (networkList, notificationController) => ({
  Proposal: {
    validator: (proposal, _, { dataSources }) => {
      //
      // Proposer value is a standard address (i.e: cosmos19wlk8gkfjckqr8d73dyp4n0f0k89q4h7xr3uwj).
      //
      // In some cases proposer address corresponds to a validator address, so we convert
      // it to an operator address. That way we can check and display if proposal comes from
      // a validator, and in that case fetch the current validator object from datasource
      // and attach it to proposal.
      //
      if (proposal.proposer) {
        const proposalNetwork = networkList.find(
          ({ id }) => id === proposal.networkId
        )
        if (proposalNetwork && proposalNetwork.network_type === `polkadot`) {
          return localStore(dataSources, proposal.networkId).validators[
            proposal.proposer
          ]
        }
        return localStore(dataSources, proposal.networkId).validators[
          proposal.proposer.address
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
    },
    profile: async (validator, _, { dataSources }) => {
      const validators = Object.values(
        localStore(dataSources, validator.networkId).validators
      )
      if (validators) {
        const network = networkList.find(({ id }) => id === validator.networkId)
        return await getValidatorProfile(
          validators,
          validator,
          remoteFetch(dataSources, validator.networkId),
          network,
          createDBInstance(validator.networkId)
        )
      }
    },
    feed: async (validator, _, { dataSources }) => {
      // get feed for this single validator
      return await getValidatorFeed(
        validator.operatorAddress,
        networkList,
        remoteFetch(dataSources, validator.networkId),
        networkList.find(({ id }) => id === validator.networkId)
      )
    }
  },
  Query: {
    proposals: async (_, { networkId }, { dataSources }) => {
      await localStore(dataSources, networkId).dataReady
      let validators = Object.values(
        localStore(dataSources, networkId).validators
      )
      return remoteFetch(dataSources, networkId).getAllProposals(validators)
    },
    proposal: async (_, { networkId, id }, { dataSources }) => {
      await localStore(dataSources, networkId).dataReady
      let validators = Object.values(
        localStore(dataSources, networkId).validators
      )
      return await remoteFetch(dataSources, networkId).getProposalById(
        id,
        validators
      )
    },
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
      const network = networkList.find((network) => network.id === id)
      return Object.assign({}, network, {
        rpc_url: network.public_rpc_url,
        public_rpc_url: undefined
      })
    },
    networks: (_, { experimental }) => {
      const networks = networkList
        .map((network) => {
          // the server side nodes are mostly whitelisted or secret so we don't want to send them to the FE
          return Object.assign({}, network, {
            rpc_url: network.public_rpc_url,
            public_rpc_url: undefined
          })
        })
        // filter out experimental networks unless the experimental flag is set to true
        .filter((network) => (experimental ? true : !network.experimental))
      return networks
    },
    maintenance: () => createDBInstance().getMaintenance(),
    balances: async (
      _,
      { networkId, address, fiatCurrency },
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      const network = networkList.find((network) => network.id === networkId)
      return remoteFetch(dataSources, networkId).getBalancesFromAddress(
        address,
        fiatCurrency,
        network
      )
    },
    balancesV2: async (
      _,
      { networkId, address, fiatCurrency },
      { dataSources, fingerprint, development }
    ) => {
      await localStore(dataSources, networkId).dataReady
      // needed to get coinLookups
      const network = networkList.find((network) => network.id === networkId)
      const balances = await remoteFetch(
        dataSources,
        networkId
      ).getBalancesV2FromAddress(address, fiatCurrency, network)
      const stakingDenomBalance = balances.find(({ type }) => type === `STAKE`)
      if (development !== 'true') {
        logBalances(
          networkList,
          stakingDenomBalance,
          address,
          networkId,
          fingerprint
        )
      }
      return balances
    },
    balance: async (
      _,
      { networkId, address, denom, fiatCurrency },
      { dataSources }
    ) => {
      await localStore(dataSources, networkId).dataReady
      // needed to get coinLookups
      const network = networkList.find((network) => network.id === networkId)
      const balances = await remoteFetch(
        dataSources,
        networkId
      ).getBalancesFromAddress(address, fiatCurrency, network)
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
      {
        networkId,
        delegatorAddress,
        operatorAddress,
        fiatCurrency,
        withHeight = false
      },
      { dataSources, fingerprint, development }
    ) => {
      await localStore(dataSources, networkId).dataReady
      const network = networkList.find((network) => network.id === networkId)
      let rewards = await remoteFetch(dataSources, networkId).getRewards(
        delegatorAddress,
        fiatCurrency,
        network,
        withHeight
      )
      if (development !== 'true' && !withHeight) {
        logRewards(
          networkList,
          rewards,
          delegatorAddress,
          networkId,
          fingerprint
        )
      }

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
    transactionsV2: (_, { networkId, address, pageNumber }, { dataSources }) =>
      remoteFetch(dataSources, networkId).getTransactionsV2(
        address,
        pageNumber
      ),
    networkFees: networkFees(networkList),
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
    notifications: getNotifications(networkList),
    accountRole: async (_, { networkId, address }, { dataSources }) => {
      await localStore(dataSources, networkId).dataReady
      if (!remoteFetch(dataSources, networkId).getAddressRole) return undefined

      return await remoteFetch(dataSources, networkId).getAddressRole(address)
    },
    governanceOverview: governanceOverview()
  },
  Mutation: {
    registerUser: (_, { idToken }) => registerUser(idToken),
    notifications: async (
      _,
      { addressObjects, notificationType, pushToken },
      { dataSources, user: { uid } }
    ) => {
      await Promise.all(
        addressObjects.map(({ networkId }) => dataSources[networkId].dataReady)
      )
      notificationController.updateRegistrations(
        uid,
        addressObjects,
        notificationType,
        dataSources,
        pushToken
      )
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
})

module.exports = resolvers
