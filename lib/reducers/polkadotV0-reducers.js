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
  if (balance == 0) {
    return []
  }
  // hack. We convert the balance into an Array to make it an Iterable
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

function delegationReducer(network, delegation, validator, active) {
  return {
    validatorAddress: validator.operatorAddress,
    delegatorAddress: delegation.who,
    validator,
    amount: delegation.value
      ? BigNumber(delegation.value)
          .times(network.coinLookup[0].chainToViewConversionFactor)
          .toFixed(9)
      : 0,
    active
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
function getMessageType(section, method) {
  switch (`${section}.${method}`) {
    case 'balances.transfer':
      return lunieMessageTypes.SEND
    case 'lunie.staking':
      return lunieMessageTypes.STAKE
    default:
      return lunieMessageTypes.UNKNOWN
  }
}

function parsePolkadotTransaction(
  hash,
  message,
  messageIndex,
  signer,
  network,
  blockHeight,
  reducers
) {
  const lunieTransactionType = getMessageType(message.section, message.method)
  return {
    type: lunieTransactionType,
    hash,
    height: blockHeight,
    key: `${hash}_${messageIndex}`,
    details: transactionDetailsReducer(
      network,
      lunieTransactionType,
      reducers,
      signer,
      message
    ),
    timestamp: new Date().getTime(), // FIXME!: pass it from block, we should get current timestamp from blockchain for new blocks
    memo: ``,
    fees: {
      amount: `0`,
      denom: network.coinLookup[0].viewDenom
    }, // FIXME!
    success: true,
    log: ``,
    involvedAddresses: reducers.extractInvolvedAddresses(
      lunieTransactionType,
      signer,
      message
    )
  }
}

function transactionReducerV2(network, extrinsic, blockHeight, reducers) {
  const hash = extrinsic.hash.toHex()
  const signer = extrinsic.signer.toString()
  const messages = aggregateLunieStaking(
    extrinsic.method.meta.name.toString() === `batch`
      ? extrinsic.method.args[0]
      : [extrinsic.method]
  )
  return messages.map((message, messageIndex) =>
    parsePolkadotTransaction(
      hash,
      message,
      messageIndex,
      signer,
      network,
      blockHeight,
      reducers
    )
  )
}

// we display staking as one tx where in Polkadot this can be 2
// so we aggregate the messags into 1
// ATTENTION this could be weird for some users
function aggregateLunieStaking(messages) {
  // lunie staking message
  let aggregatedLunieStaking = {
    method: 'staking',
    section: 'lunie',
    validators: [],
    amount: 0
  }
  let hasBond = false
  let hasNominate = false
  let reducedMessages = []
  messages.forEach(current => {
    if (
      current.toHuman().section === 'staking' &&
      current.toHuman().method === 'bond'
    ) {
      aggregatedLunieStaking.amount =
        aggregatedLunieStaking.amount + current.args.value
      hasBond = true
    }

    if (
      current.toHuman().section === 'staking' &&
      current.toHuman().method === 'bondExtra'
    ) {
      aggregatedLunieStaking.amount =
        aggregatedLunieStaking.amount + current.args.max_additional
      hasBond = true
    }

    if (
      current.toHuman().section === 'staking' &&
      current.toHuman().method === 'nominate'
    ) {
      aggregatedLunieStaking.validators = aggregatedLunieStaking.validators.concat(
        current.args[0].toHuman()
      )
      hasNominate = true
    }
    reducedMessages.push({
      section: current.toHuman().section,
      method: current.toHuman().method,
      args: JSON.parse(JSON.stringify(current.args, null, 2))
    })
  })
  return hasBond && hasNominate
    ? reducedMessages.concat(aggregatedLunieStaking)
    : reducedMessages
}

// Map polkadot messages to our details format
function transactionDetailsReducer(
  network,
  lunieTransactionType,
  reducers,
  signer,
  message
) {
  let details
  switch (lunieTransactionType) {
    case lunieMessageTypes.SEND:
      details = sendDetailsReducer(network, message, signer, reducers)
      break
    case lunieMessageTypes.STAKE:
      details = stakeDetailsReducer(network, message, reducers)
      break
    default:
      details = {}
  }
  return {
    type: lunieTransactionType,
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

function sendDetailsReducer(network, message, signer, reducers) {
  return {
    from: [signer],
    to: [message.args[0]],
    amount: reducers.coinReducer(network, message.args[1])
  }
}

// the message for staking is created by `aggregateLunieStaking`
function stakeDetailsReducer(network, message, reducers) {
  return {
    to: message.validators,
    amount: reducers.coinReducer(network, message.amount)
  }
}

function extractInvolvedAddresses(lunieTransactionType, signer, message) {
  let involvedAddresses = []
  if (lunieTransactionType === lunieMessageTypes.SEND) {
    involvedAddresses = involvedAddresses.concat([signer, message.args[0]])
  }
  if (lunieTransactionType === lunieMessageTypes.STAKE) {
    involvedAddresses = involvedAddresses.concat([signer], message.validators)
  }
  return _.uniq(involvedAddresses)
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
          collectionReward.address === validatorReward.address &&
          JSON.stringify(collectionReward.validator) ===
            JSON.stringify(validatorReward.validator)
      )
      if (existingRewardCollectionForValidator) {
        existingRewardCollectionForValidator.amount = (
          parseFloat(existingRewardCollectionForValidator.amount) +
          parseFloat(validatorReward.amount)
        ).toFixed(9)
      } else {
        collection.push(validatorReward)
      }
    })
    return collection
  }, [])
}

function dbRewardsReducer(validatorsDictionary, dbRewards) {
  const aggregatedRewards = dbRewards.reduce((sum, reward) => {
    sum[reward.validator] = sum[reward.validator] || {}
    sum[reward.validator][reward.denom] =
      (sum[reward.validator][reward.denom] || 0) + reward.amount
    return sum
  }, {})
  const flattenedAggregatedRewards = Object.entries(aggregatedRewards).reduce(
    (sum, [validator, reward]) => {
      sum = sum.concat(
        Object.entries(reward).map(([denom, amount]) => ({
          validator,
          denom,
          amount
        }))
      )
      return sum
    },
    []
  )
  return flattenedAggregatedRewards.map(reward => ({
    ...reward,
    validator: validatorsDictionary[reward.validator]
  }))
}

function rewardReducer(network, validators, reward, reducers) {
  let parsedRewards = []
  Object.entries(reward.validators).map(validatorReward => {
    const lunieReward = {
      ...reducers.coinReducer(network, validatorReward[1].toString()),
      height: reward.era,
      address: reward.address,
      validator: validators[validatorReward[0]], // used for user facing rewards in the API
      validatorAddress: validatorReward[0] // added for writing the validator to the db even it it is not in the dictionary
    }
    parsedRewards.push(lunieReward)
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
  rewardsReducer,
  dbRewardsReducer
}
