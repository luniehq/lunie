const { reverse, sortBy, uniq, uniqWith } = require('lodash')
const Sentry = require('@sentry/node')
const { lunieMessageTypes } = require('../../lib/message-types')
const cosmosV0Reducers = require('./cosmosV0-reducers')
const {
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  tallyReducer,
  atoms,
  getValidatorStatus,
  coinReducer
} = cosmosV0Reducers

// map Cosmos SDK message types to Lunie message types
function getMessageType(type) {
  // different networks use different prefixes for the transaction types like cosmos/MsgSend vs core/MsgSend in Terra
  const transactionTypeSuffix = type.split('/')[1]
  switch (transactionTypeSuffix) {
    case 'MsgSend':
      return lunieMessageTypes.SEND
    case 'MsgDelegate':
      return lunieMessageTypes.STAKE
    case 'MsgBeginRedelegate':
      return lunieMessageTypes.RESTAKE
    case 'MsgUndelegate':
      return lunieMessageTypes.UNSTAKE
    case 'MsgWithdrawDelegationReward':
      return lunieMessageTypes.CLAIM_REWARDS
    case 'MsgSubmitProposal':
      return lunieMessageTypes.SUBMIT_PROPOSAL
    case 'MsgVote':
      return lunieMessageTypes.VOTE
    case 'MsgDeposit':
      return lunieMessageTypes.DEPOSIT
    default:
      return lunieMessageTypes.UNKNOWN
  }
}

function setTransactionSuccess(transaction, index) {
  return transaction.logs && transaction.logs[index]
    ? transaction.logs[index].success || false
    : false
}

function sendDetailsReducer(message, reducers) {
  return {
    from: [message.from_address],
    to: [message.to_address],
    amount: reducers.coinReducer(message.amount[0])
  }
}

function stakeDetailsReducer(message, reducers) {
  return {
    to: [message.validator_address],
    amount: reducers.coinReducer(message.amount)
  }
}

function restakeDetailsReducer(message, reducers) {
  return {
    from: [message.validator_src_address],
    to: [message.validator_dst_address],
    amount: reducers.coinReducer(message.amount)
  }
}

function unstakeDetailsReducer(message, reducers) {
  return {
    from: [message.validator_address],
    amount: reducers.coinReducer(message.amount)
  }
}

function claimRewardsDetailsReducer(message, reducers, transaction) {
  return {
    from: message.validators,
    amounts: claimRewardsAmountReducer(transaction, reducers)
  }
}

function claimRewardsAmountReducer(transaction, reducers) {
  const transactionClaimEvents =
    transaction.events &&
    transaction.events.filter((event) => event.type === `transfer`)
  if (!transactionClaimEvents) {
    return [{ denom: '', amount: 0 }]
  }
  // filter out unsuccessful messages
  if (transaction.logs) {
    transaction.logs.forEach((log, index) => {
      if (log.success !== true) {
        transactionClaimEvents.splice(index, 1)
      }
    })
  }
  // if transactionClaimEvents is empty after the successful transaction check, we default it
  if (transactionClaimEvents.length === 0) {
    return [{ denom: '', amount: 0 }]
  }
  const amountAttributes = transactionClaimEvents
    .map((tx) => tx.attributes)
    .find((attributes) => attributes.length > 0)
    .filter((attribute) => attribute.key === `amount`)
  const allClaimedRewards = amountAttributes
    .map((amount) => amount.value)
    .map((rewardValue) => reducers.rewardCoinReducer(rewardValue))
  const aggregatedClaimRewardsObject = allClaimedRewards.reduce(
    (all, rewards) => {
      rewards.forEach((reward) => {
        all = {
          ...all,
          [reward.denom]: reward.amount.plus(all[reward.denom] || 0)
        }
      })
      return all
    },
    {}
  )
  const claimedRewardsDenomArray = Object.entries(aggregatedClaimRewardsObject)
  return claimedRewardsDenomArray.map(([denom, amount]) => ({ denom, amount }))
}

function submitProposalDetailsReducer(message, reducers) {
  return {
    proposalType: message.content.type,
    proposalTitle: message.content.value.title,
    proposalDescription: message.content.value.description,
    initialDeposit: reducers.coinReducer(message.initial_deposit[0])
  }
}

function voteProposalDetailsReducer(message) {
  return {
    proposalId: message.proposal_id,
    voteOption: message.option
  }
}

function depositDetailsReducer(message, reducers) {
  return {
    proposalId: message.proposal_id,
    amount: reducers.coinReducer(message.amount[0])
  }
}

// function to map cosmos messages to our details format
function transactionDetailsReducer(type, message, reducers, transaction) {
  let details
  switch (type) {
    case lunieMessageTypes.SEND:
      details = reducers.sendDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.STAKE:
      details = reducers.stakeDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.RESTAKE:
      details = reducers.restakeDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.UNSTAKE:
      details = reducers.unstakeDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.CLAIM_REWARDS:
      details = reducers.claimRewardsDetailsReducer(
        message,
        reducers,
        transaction
      )
      break
    case lunieMessageTypes.SUBMIT_PROPOSAL:
      details = reducers.submitProposalDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.VOTE:
      details = reducers.voteProposalDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.DEPOSIT:
      details = reducers.depositDetailsReducer(message, reducers)
      break
    default:
      details = {}
  }

  return {
    type,
    ...details
  }
}

function claimRewardsMessagesAggregator(claimMessages) {
  // reduce all withdraw messages to one one collecting the validators from all the messages
  const onlyValidatorsAddressesArray = claimMessages.map(
    (msg) => msg.value.validator_address
  )
  return {
    type: `cosmos-sdk/MsgWithdrawDelegationReward`,
    value: {
      validators: onlyValidatorsAddressesArray
    }
  }
}

function proposalReducer(
  networkId,
  proposal,
  tally,
  proposer,
  totalBondedTokens
) {
  return {
    networkId,
    id: Number(proposal.id),
    type: proposal.content.type,
    title: proposal.content.value.title,
    description: proposal.content.value.description,
    creationTime: proposal.submit_time,
    status: proposal.proposal_status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, tally, totalBondedTokens),
    deposit: getDeposit(proposal, 'stake'), // TODO use denom lookup + use network config
    proposer: proposer.proposer
  }
}

function transactionReducerV2(networkId, transaction, reducers) {
  try {
    // TODO check if this is anywhere not an array
    let fees
    if (
      transaction.tx.value &&
      Array.isArray(transaction.tx.value.fee.amount)
    ) {
      fees = transaction.tx.value.fee.amount.map(coinReducer)
    } else {
      fees = [coinReducer(transaction.tx.value.fee.amount)]
    }
    // We do display only the transactions we support in Lunie
    const filteredMessages = transaction.tx.value.msg.filter(
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
      type: reducers.getMessageType(type),
      hash: transaction.txhash,
      key: `${transaction.txhash}_${index}`,
      height: transaction.height,
      details: transactionDetailsReducer(
        reducers.getMessageType(type),
        value,
        reducers,
        transaction
      ),
      timestamp: transaction.timestamp,
      memo: transaction.tx.value.memo,
      fees,
      success: reducers.setTransactionSuccess(transaction, index, networkId),
      log:
        transaction.logs && transaction.logs[index]
          ? transaction.logs[index].log
            ? transaction.logs[index].log || transaction.logs[0] // failing txs show the first logs
            : transaction.logs[0].log || ''
          : JSON.parse(JSON.stringify(transaction.raw_log)).message,
      involvedAddresses: uniq(reducers.extractInvolvedAddresses(transaction))
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

function transactionsReducerV2(networkId, txs, reducers) {
  const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  const reversedTxs = reverse(sortedTxs)
  // here we filter out all transactions related to validators
  return reversedTxs.reduce((collection, transaction) => {
    return collection.concat(
      transactionReducerV2(networkId, transaction, reducers)
    )
  }, [])
}

function delegationReducer(delegation, validator, active) {
  return {
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: delegation.balance ? atoms(delegation.balance) : 0,
    active
  }
}

function validatorReducer(networkId, signedBlocksWindow, validator) {
  const statusInfo = getValidatorStatus(validator)
  let websiteURL = validator.description.website
  if (!websiteURL || websiteURL === '[do-not-modify]') {
    websiteURL = ''
  } else if (!websiteURL.match(/http[s]?/)) {
    websiteURL = `https://` + websiteURL
  }

  return {
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
    uptimePercentage:
      1 -
      Number(
        validator.signing_info
          ? validator.signing_info.missed_blocks_counter
          : 0
      ) /
        Number(signedBlocksWindow),
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: Number(validator.commission.commission_rates.rate).toFixed(6),
    maxCommission: validator.commission.commission_rates.max_rate,
    maxChangeCommission: validator.commission.commission_rates.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    popularity: validator.popularity
  }
}

function extractInvolvedAddresses(transaction) {
  // If the transaction has failed, it doesn't get tagged
  if (!Array.isArray(transaction.events)) return []

  // extract all addresses from events that are either sender or recipient
  const involvedAddresses = transaction.events.reduce(
    (involvedAddresses, event) => {
      const senderAttributes = event.attributes
        .filter(({ key }) => key === 'sender')
        .map((sender) => sender.value)
      if (senderAttributes.length) {
        involvedAddresses = [...involvedAddresses, ...senderAttributes]
      }

      const recipientAttribute = event.attributes.find(
        ({ key }) => key === 'recipient'
      )
      if (recipientAttribute) {
        involvedAddresses.push(recipientAttribute.value)
      }

      return involvedAddresses
    },
    []
  )
  return involvedAddresses
}

function undelegationEndTimeReducer(transaction) {
  if (transaction.events) {
    let completionTimeAttribute
    transaction.events.find(({ attributes }) => {
      if (attributes) {
        completionTimeAttribute = attributes.find(
          (tx) => tx.key === `completion_time`
        )
      }
      return !!completionTimeAttribute
    })
    return completionTimeAttribute ? completionTimeAttribute.value : undefined
  } else {
    return null
  }
}

module.exports = {
  // CosmosV0 Reducers
  ...cosmosV0Reducers,
  transactionsReducerV2,
  transactionReducerV2,
  sendDetailsReducer,
  stakeDetailsReducer,
  restakeDetailsReducer,
  unstakeDetailsReducer,
  claimRewardsDetailsReducer,
  submitProposalDetailsReducer,
  voteProposalDetailsReducer,
  depositDetailsReducer,
  getMessageType,
  proposalReducer,
  delegationReducer,
  validatorReducer,
  undelegationEndTimeReducer,
  extractInvolvedAddresses,
  setTransactionSuccess
}
