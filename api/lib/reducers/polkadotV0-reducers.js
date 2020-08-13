const _ = require('lodash')
const BigNumber = require('bignumber.js')
const { fixDecimalsAndRoundUp } = require('../../common/numbers.js')
const { lunieMessageTypes } = require('../../lib/message-types')

const CHAIN_TO_VIEW_COMMISSION_CONVERSION_FACTOR = 1e-9

function blockReducer(
  networkId,
  chainId,
  blockHeight,
  blockHash,
  sessionIndex,
  blockAuthor,
  transactions,
  data = {}
) {
  return {
    id: blockHash,
    networkId,
    height: blockHeight,
    chainId,
    hash: blockHash,
    sessionIndex,
    time: new Date().toISOString(), // TODO: Get from blockchain state
    transactions,
    proposer_address: blockAuthor,
    data: JSON.stringify(data)
  }
}

function validatorReducer(network, validator) {
  return {
    id: validator.accountId,
    networkId: network.id,
    chainId: network.chain_id,
    operatorAddress: validator.accountId,
    website:
      validator.identity.web && validator.identity.web !== ``
        ? validator.identity.web
        : ``,
    identity: validator.identity.twitter,
    name: identityReducer(validator.accountId, validator.identity),
    votingPower: validator.votingPower.toFixed(6),
    startHeight: undefined,
    uptimePercentage: undefined,
    tokens: validator.tokens,
    commissionUpdateTime: undefined,
    commission: (
      validator.validatorPrefs.commission *
      CHAIN_TO_VIEW_COMMISSION_CONVERSION_FACTOR
    ).toFixed(6),
    maxCommission: undefined,
    maxChangeCommission: undefined,
    status: validator.status,
    statusDetailed: validator.status.toLowerCase(),
    delegatorShares: undefined,
    selfStake:
      (
        BigNumber(validator.exposure.own).toNumber() *
        network.coinLookup[0].chainToViewConversionFactor
      ).toFixed(6) || 0,
    expectedReturns: validator.expectedReturns,
    nominations: validator.nominations,
    popularity: validator.popularity
  }
}

function identityReducer(address, identity) {
  if (
    identity.displayParent &&
    identity.displayParent !== `` &&
    identity.display &&
    identity.display !== ``
  ) {
    return `${identity.displayParent}/${identity.display}`
  } else {
    return identity.display && identity.display !== ``
      ? identity.display
      : address
  }
}

async function balanceReducer(
  network,
  balance,
  total,
  fiatValueAPI,
  fiatCurrency
) {
  if (total === '0') {
    return []
  }
  const lunieCoin = coinReducer(network, balance, 6)
  const fiatValues = await fiatValueAPI.calculateFiatValues(
    [lunieCoin],
    fiatCurrency
  )
  return [
    {
      id: lunieCoin.denom,
      amount: lunieCoin.amount,
      total: fixDecimalsAndRoundUp(
        BigNumber(total)
          .times(network.coinLookup[0].chainToViewConversionFactor)
          .toNumber(),
        6
      ),
      denom: lunieCoin.denom,
      fiatValue: fiatValues[lunieCoin.denom]
    }
  ]
}

async function balanceV2Reducer(
  network,
  balance,
  total,
  fiatValueAPI,
  fiatCurrency
) {
  const availableLunieCoin = coinReducer(network, balance, 6)
  const totalLunieCoin = coinReducer(network, total, 6)
  const availableFiatValue = (
    await fiatValueAPI.calculateFiatValues([availableLunieCoin], fiatCurrency)
  )[availableLunieCoin.denom]
  const totalFiatValue = (
    await fiatValueAPI.calculateFiatValues([totalLunieCoin], fiatCurrency)
  )[totalLunieCoin.denom]

  if (total === '0') {
    return {
      id: availableLunieCoin.denom,
      type: 'STAKE',
      available: 0,
      total: 0,
      denom: availableLunieCoin.denom,
      availableFiatValue,
      fiatValue: totalFiatValue
    }
  }

  return {
    id: availableLunieCoin.denom,
    type: 'STAKE', // just a staking denom on Kusama for now
    available: availableLunieCoin.amount,
    total: totalLunieCoin.amount,
    denom: availableLunieCoin.denom,
    availableFiatValue,
    fiatValue: totalFiatValue
  }
}

function delegationReducer(network, delegation, validator, active) {
  if (validator === undefined) return {} // TODO: once we can use the debugger on Polkadot, really debug why this happens
  return {
    id: validator.operatorAddress,
    validatorAddress: validator.operatorAddress,
    delegatorAddress: delegation.who,
    validator,
    amount: delegation.value
      ? BigNumber(delegation.value)
          .times(network.coinLookup[0].chainToViewConversionFactor)
          .toFixed(6)
      : 0,
    active
  }
}

function undelegationReducer(network, delegation, validator, active) {
  return {
    ...delegationReducer(network, delegation, validator, active),
    endTime: ``,
    startHeight: ``
  }
}

function transactionsReducerV2(
  network,
  extrinsics,
  blockEvents,
  blockHeight,
  reducers
) {
  // Filter Polkadot tx to Lunie supported types
  return extrinsics.reduce((collection, extrinsic, index) => {
    return collection.concat(
      transactionReducerV2(
        network,
        extrinsic,
        index,
        blockEvents,
        blockHeight,
        reducers
      )
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
  success,
  network,
  blockHeight,
  reducers
) {
  const lunieTransactionType = getMessageType(message.section, message.method)
  return {
    id: hash,
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
    fees: [
      {
        amount: `0`,
        denom: network.coinLookup[0].viewDenom
      }
    ], // FIXME!
    success,
    log: ``,
    involvedAddresses: reducers.extractInvolvedAddresses(
      lunieTransactionType,
      signer,
      message
    )
  }
}

function getExtrinsicSuccess(extrinsicIndex, blockEvents, isBatch) {
  const events = blockEvents.filter(({ phase }) => {
    return parseInt(phase.toHuman().ApplyExtrinsic) === extrinsicIndex // index is a string
  })
  // if tx is a batch, we need to check if all of the batched txs went through
  if (isBatch) {
    return !!events.find(
      ({ event }) =>
        event.section === `utility` && event.method === `BatchCompleted`
    )
  }
  return !!events.find(
    ({ event }) =>
      event.section === `system` && event.method === `ExtrinsicSuccess`
  )
}

function transactionReducerV2(
  network,
  extrinsic,
  index,
  blockEvents,
  blockHeight,
  reducers
) {
  const hash = extrinsic.hash.toHex()
  const signer = extrinsic.signer.toString()
  const isBatch = extrinsic.method.meta.name.toString() === `batch`
  const messages = aggregateLunieStaking(
    isBatch ? extrinsic.method.args[0] : [extrinsic.method]
  )
  const success = reducers.getExtrinsicSuccess(index, blockEvents, isBatch)
  return messages.map((message, messageIndex) =>
    parsePolkadotTransaction(
      hash,
      message,
      messageIndex,
      signer,
      success,
      network,
      blockHeight,
      reducers
    )
  )
}

// we display staking as one tx where in Polkadot this can be 2
// so we aggregate the messages into 1
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
  messages.forEach((current) => {
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

function coinReducer(network, amount, decimals = 6) {
  if (!amount) {
    return {
      amount: 0,
      denom: ''
    }
  }

  return {
    denom: network.coinLookup[0].viewDenom,
    amount: fixDecimalsAndRoundUp(
      BigNumber(amount).times(
        network.coinLookup[0].chainToViewConversionFactor
      ),
      decimals
    )
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
  } else if (lunieTransactionType === lunieMessageTypes.STAKE) {
    involvedAddresses = involvedAddresses.concat([signer], message.validators)
  } else {
    involvedAddresses = involvedAddresses.concat([signer])
  }
  return _.uniq(involvedAddresses)
}

function rewardsReducer(network, validators, rewards, reducers) {
  const allRewards = []
  const validatorsDict = _.keyBy(validators, 'operatorAddress')
  rewards.forEach((reward) => {
    // reward reducer returns an array
    allRewards.push(
      ...reducers.rewardReducer(network, validatorsDict, reward, reducers)
    )
  })
  return allRewards
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
          amount: amount.toFixed(6)
        }))
      )
      return sum
    },
    []
  )
  return flattenedAggregatedRewards.map((reward) => ({
    ...reward,
    validator: validatorsDictionary[reward.validator]
  }))
}

function rewardReducer(network, validators, reward, reducers) {
  let parsedRewards = []
  Object.entries(reward.validators).forEach((validatorReward) => {
    const validator = validators[validatorReward[0]]
    if (!validator) return
    const lunieReward = {
      id: validatorReward[0],
      ...reducers.coinReducer(network, validatorReward[1].toString(10)),
      height: reward.era,
      address: reward.address,
      validator, // used for user facing rewards in the API
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
  balanceV2Reducer,
  delegationReducer,
  undelegationReducer,
  extractInvolvedAddresses,
  transactionsReducerV2,
  transactionDetailsReducer,
  sendDetailsReducer,
  coinReducer,
  rewardReducer,
  rewardsReducer,
  dbRewardsReducer,
  identityReducer,
  getExtrinsicSuccess
}
