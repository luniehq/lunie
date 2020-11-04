const Sentry = require('@sentry/node')
const { uniq } = require('lodash')
const cosmosV2Reducers = require('./cosmosV2-reducers')
const { atoms, coinReducer } = require('./cosmosV0-reducers')
const { lunieMessageTypes } = require('../../lib/message-types')

function blockReducer(networkId, block, transactions, data = {}) {
  return {
    id: block.block_id.hash,
    networkId,
    height: block.block.header.height,
    chainId: block.block.header.chain_id,
    hash: block.block_id.hash,
    time: block.block.header.time,
    transactions,
    proposer_address: block.block.header.proposer_address,
    data: JSON.stringify(data)
  }
}

function validatorReducer(
  networkId,
  signedBlocksWindow,
  validator,
  fiatValuesResponse
) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  return {
    id: validator.operator_address,
    networkId,
    operatorAddress: validator.operator_address,
    consensusPubkey: validator.consensus_pubkey,
    jailed: validator.jailed,
    details: validator.description.details,
    website: websiteURL,
    identity: validator.description.identity,
    name: validator.description.moniker,
    votingPower: validator.voting_power.toFixed(6),
    startHeight: validator.signing_info
      ? validator.signing_info.start_height
      : undefined,
    uptimePercentage: 0, // TODO
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: Number(validator.commission.commission_rates.rate).toFixed(6),
    maxCommission: validator.commission.commission_rates.max_rate,
    maxChangeCommission: validator.commission.commission_rates.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    popularity: validator.popularity,
    totalStakedAssets: {
      ...fiatValuesResponse[network.stakingDenom],
      amount: fiatValuesResponse[network.stakingDenom].amount.toFixed(2)
    }
  }
}

function delegationReducer(delegation, validator, active, network) {
  const coinLookup = network.getCoinLookup(network, delegation.balance.denom)
  const { amount, denom } = coinReducer(delegation.balance, coinLookup)

  return {
    id: delegation.delegation.validator_address.concat(`-${denom}`),
    validatorAddress: delegation.delegation.validator_address,
    delegatorAddress: delegation.delegation.delegator_address,
    validator,
    amount,
    active
  }
}

function getValidatorStatus(validator) {
  if (validator.status === 3) {
    return {
      status: 'ACTIVE',
      status_detailed: 'active'
    }
  }
  if (
    validator.signing_info &&
    new Date(validator.signing_info.jailed_until) > new Date(9000, 1, 1)
  ) {
    return {
      status: 'INACTIVE',
      status_detailed: 'banned'
    }
  }

  return {
    status: 'INACTIVE',
    status_detailed: 'inactive'
  }
}

function transactionReducerV2(network, transaction, reducers) {
  try {
    // TODO check if this is anywhere not an array
    let fees
    if (
      transaction.tx.value &&
      Array.isArray(transaction.tx.value.fee.amount)
    ) {
      fees = transaction.tx.value.fee.amount.map((coin) => {
        const coinLookup = network.getCoinLookup(network, coin.denom)
        return coinReducer(coin, coinLookup)
      })
    } else {
      fees = transaction.tx.auth_info.fee.amount.map((fee) => {
        const coinLookup = network.getCoinLookup(network, fee.denom)
        return coinReducer(fee, coinLookup)
      })
    }
    // We do display only the transactions we support in Lunie
    const filteredMessages = transaction.tx.body.messages.filter(
      ({ type }) => reducers.getMessageType(type) !== 'Unknown'
    )
    const { claimMessages, otherMessages } = filteredMessages.reduce(
      ({ claimMessages, otherMessages }, message) => {
        // we need to aggregate all withdraws as we display them together in one transaction
        if (
          reducers.getMessageType(message.type) ===
          lunieMessageTypes.CLAIM_REWARDS
        ) {
          claimMessages.push(message)
        } else {
          otherMessages.push(message)
        }
        return { claimMessages, otherMessages }
      },
      { claimMessages: [], otherMessages: [] }
    )

    // we need to aggregate claim rewards messages in one single one to avoid transaction repetition
    const claimMessage =
      claimMessages.length > 0
        ? claimRewardsMessagesAggregator(claimMessages)
        : undefined
    const allMessages = claimMessage
      ? otherMessages.concat(claimMessage) // add aggregated claim message
      : otherMessages
    const returnedMessages = allMessages.map(({ value, type }, index) => ({
      id: transaction.txhash,
      type: reducers.getMessageType(type),
      hash: transaction.txhash,
      networkId: network.id,
      key: `${transaction.txhash}_${index}`,
      height: transaction.height,
      details: reducers.transactionDetailsReducer(
        reducers.getMessageType(type),
        value,
        reducers,
        transaction,
        network
      ),
      timestamp: transaction.timestamp,
      memo: transaction.tx.body.memo,
      fees,
      success: reducers.setTransactionSuccess(transaction, index, network.id),
      log:
        transaction.logs && transaction.logs[index]
          ? transaction.logs[index].log
            ? transaction.logs[index].log || transaction.logs[0] // failing txs show the first logs
            : transaction.logs[0].log || ''
          : JSON.parse(JSON.stringify(transaction.raw_log)).message,
      involvedAddresses: Array.isArray(transaction.logs)
        ? uniq(
            reducers.extractInvolvedAddresses(
              transaction.logs.find(({ msg_index }) => msg_index === index)
                .events
            )
          )
        : []
    }))
    return returnedMessages
  } catch (error) {
    console.error(error)
    Sentry.withScope(function (scope) {
      scope.setExtra('transaction', transaction)
      Sentry.captureException(error)
    })
    return [] // must return something differ from undefined
  }
}

function setTransactionSuccess(transaction, index) {
  // TODO identify logs per message
  if (transaction.code) {
    return false
  }
  return true
}

function undelegationEndTimeReducer(transaction) {
  const events = transaction.logs.reduce(
    (events, log) => (log.events ? events.concat(log.events) : events),
    []
  )

  let completionTimeAttribute
  events.find(({ attributes }) => {
    if (attributes) {
      completionTimeAttribute = attributes.find(
        (tx) => tx.key === `completion_time`
      )
    }
    return !!completionTimeAttribute
  })
  return completionTimeAttribute ? completionTimeAttribute.value : undefined
}

function accountInfoReducer(accountValue, accountType) {
  return {
    address: accountValue.address,
    accountNumber: accountValue.account_number,
    sequence: accountValue.sequence || 0,
    vestingAccount: accountType.includes(`VestingAccount`)
  }
}

module.exports = {
  ...cosmosV2Reducers,
  blockReducer,
  validatorReducer,
  delegationReducer,
  transactionReducerV2,
  undelegationEndTimeReducer,
  setTransactionSuccess,
  accountInfoReducer
}
