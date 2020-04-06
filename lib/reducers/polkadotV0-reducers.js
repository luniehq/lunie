const _ = require('lodash')
const BigNumber = require('bignumber.js')

const { lunieMessageTypes } = require('../../lib/message-types')

function blockReducer(
  networkId,
  blockHeight,
  blockHash,
  sessionIndex,
  blockAuthor,
  transactions
) {
  return {
    networkId,
    height: blockHeight,
    chainId: `kusama-cc3`,
    hash: blockHash,
    sessionIndex,
    time: new Date().toISOString(), // TODO: Get from blockchain state
    transactions,
    proposer_address: blockAuthor
  }
}

function validatorReducer(network, validator) {
  return {
    networkId: network.id,
    chainId: network.chain_id,
    operatorAddress: validator.accountId,
    website:
      validator.identity.web && validator.identity.web !== ``
        ? validator.identity.web
        : ``,
    identity:
      validator.identity.display && validator.identity.display !== ``
        ? validator.identity.display
        : validator.accountId,
    name:
      validator.identity.display && validator.identity.display !== ``
        ? validator.identity.display
        : validator.accountId,
    votingPower: validator.votingPower.toFixed(9),
    startHeight: undefined,
    uptimePercentage: undefined,
    tokens: validator.tokens,
    commissionUpdateTime: undefined,
    commission: (validator.validatorPrefs.commission / 1000000000).toFixed(9), // Returns commission in 0-1 range (1 = 100%)
    maxCommission: undefined,
    maxChangeCommission: undefined,
    status: validator.status,
    statusDetailed: ``, // TODO: Include validator heartbeat messages
    delegatorShares: undefined,
    selfStake:
      (
        BigNumber(validator.exposure.own).toNumber() *
        network.coinLookup[0].chainToViewConversionFactor
      ).toFixed(9) || 0,
    nominations: validator.nominations
  }
}

function balanceReducer(network, balance, total) {
  // hack. We convert the balance into an Array to make it an Iterable
  if (balance == 0) {
    return []
  }
  return [
    {
      amount:
        (BigNumber(balance)
          .times(network.coinLookup[0].chainToViewConversionFactor)
          .toFixed(4) *
          10000) /
        10000,
      total:
        (BigNumber(total)
          .times(network.coinLookup[0].chainToViewConversionFactor)
          .toFixed(4) *
          10000) /
        10000,
      denom: network.coinLookup[0].viewDenom
    }
  ]
}

function delegationReducer(network, delegation, validator) {
  return {
    validatorAddress: validator.operatorAddress,
    delegatorAddress: delegation.who,
    validator,
    amount: BigNumber(delegation.value)
      .times(network.coinLookup[0].chainToViewConversionFactor)
      .toFixed(9)
  }
}

function transactionsReducerV2(network, extrinsics, blockHeight, reducers) {
  // Filter Polkadot tx to Lunie supported types
  return extrinsics.reduce((collection, extrinsic) => {
    return collection.concat(
      transactionReducerV2(network, extrinsic, blockHeight, reducers)
    )
  }, [])
}

// Map Polkadot event method to Lunie message types
function getMessageType(type) {
  switch (type) {
    case 'transfer':
      return lunieMessageTypes.SEND
    default:
      return lunieMessageTypes.UNKNOWN
  }
}

function transactionReducerV2(network, extrinsic, blockHeight, reducers) {
  if (extrinsic.method.meta.name.toString() === `transfer`) {
    const tx = {
      type: getMessageType(extrinsic.method.meta.name.toString()),
      hash: extrinsic.hash.toHex(),
      height: blockHeight,
      details: transactionDetailsReducer(
        network,
        getMessageType(extrinsic.method.meta.name.toString()),
        reducers,
        extrinsic
      ),
      timestamp: new Date().getTime(), // FIXME!: pass it from block, we should get current timestamp from blockchain for new blocks
      memo: ``,
      fees: {
        amount: `0`,
        denom: `KSM`
      }, // FIXME!
      success: true,
      log: ``,
      involvedAddresses: _.uniq(reducers.extractInvolvedAddresses(extrinsic))
    }
    return [tx]
  }
  return []
}

// Map polkadot messages to our details format
function transactionDetailsReducer(network, type, reducers, extrinsic) {
  let details
  switch (type) {
    case lunieMessageTypes.SEND:
      details = sendDetailsReducer(network, extrinsic, reducers)
      break
    default:
      details = {}
  }
  return {
    type,
    ...details
  }
}

function coinReducer(network, amount) {
  if (!amount) {
    return {
      amount: 0,
      denom: ''
    }
  }

  return {
    denom: network.coinLookup[0].viewDenom,
    amount: BigNumber(amount)
      .times(network.coinLookup[0].chainToViewConversionFactor)
      .toFixed(9)
  }
}

function sendDetailsReducer(network, extrinsic, reducers) {
  return {
    from: [extrinsic.signer.toString()],
    to: [extrinsic.args[0].toString()],
    amount: reducers.coinReducer(network, extrinsic.args[1])
  }
}

// TO IMPROVE: duplicate logic in reducer and address extraction
function extractInvolvedAddresses(extrinsic) {
  if (extrinsic.method.meta.name.toString() === `transfer`) {
    const involvedAddresses = [
      extrinsic.signer.toString(),
      extrinsic.args[0].toString()
    ]
    return involvedAddresses
  }
  return []
}

// Flatten era rewards and then aggregate per validator
function rewardsReducer(network, validators, rewards, reducers) {
  return rewards.reduce((collection, reward) => {
    const validatorRewards = reducers.rewardReducer(
      network,
      validators,
      reward,
      reducers
    )
    validatorRewards.forEach(validatorReward => {
      const existingRewardCollectionForValidator = collection.find(
        collectionReward =>
          collectionReward.validator === validatorReward.validator
      )
      if (existingRewardCollectionForValidator) {
        existingRewardCollectionForValidator.amount =
          parseFloat(existingRewardCollectionForValidator.amount) +
          parseFloat(validatorReward.amount)
      } else {
        collection.push(validatorReward)
      }
    })
    return collection
  }, [])
}

function rewardReducer(network, validators, reward, reducers) {
  let parsedRewards = []
  Object.entries(reward.validators).map(validatorReward => {
    const reward = {
      ...reducers.coinReducer(network, validatorReward[1].toString()),
      validator: validators[validatorReward[0]],
      validatorAddress: validatorReward[0] // added for writing the validator to the db even it it is not in the dictionary
    }
    parsedRewards.push(reward)
  })
  return parsedRewards
}

module.exports = {
  blockReducer,
  validatorReducer,
  balanceReducer,
  delegationReducer,
  extractInvolvedAddresses,
  transactionsReducerV2,
  transactionDetailsReducer,
  sendDetailsReducer,
  coinReducer,
  rewardReducer,
  rewardsReducer
}
