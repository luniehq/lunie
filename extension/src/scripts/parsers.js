'use strict'

import BigNumber from 'bignumber.js'

export function getDisplayTransaction(
  network,
  messageType,
  message,
  transactionData
) {
  let fees = []
  if (network.network_type === 'cosmos') {
    const coinLookup = network.coinLookup.find(
      ({ chainDenom }) =>
        chainDenom === transactionData.fee.find(({ denom }) => denom).denom
    )
    fees = [
      {
        amount: BigNumber(
          transactionData.fee.find(({ amount }) => amount).amount
        )
          .times(coinLookup.chainToViewConversionFactor)
          .toString(),
        denom: coinLookup.viewDenom
      }
    ]
  }
  if (
    network.network_type === 'polkadot' &&
    transactionData &&
    !!transactionData.fee
  ) {
    fees = [transactionData.fee]
  }
  return {
    type: messageType,
    details: message,
    fees
  }
}

// delegations rewards in Tendermint are located in events as strings with this form:
// amount: {"15000umuon"}, or in multidenom networks they look like this:
// amount: {"15000ungm,100000uchf,110000ueur,2000000ujpy"}
// That is why we need this separate function to extract those amounts in this format
function rewardCoinReducer(reward, network) {
  const numBit = reward.match(/[0-9]+/gi)
  const stringBit = reward.match(/[a-z]+/gi)
  const multiDenomRewardsArray = reward.split(`,`)
  if (multiDenomRewardsArray.length > 1) {
    const mappedMultiDenomRewardsArray = multiDenomRewardsArray.map((reward) =>
      rewardCoinReducer(reward, network)
    )
    let stakingDenomRewards = mappedMultiDenomRewardsArray.find(
      ({ denom }) => denom === network.stakingDenom
    )
    // if there is no staking denom reward we will display the first alt-token reward
    return (
      stakingDenomRewards ||
      mappedMultiDenomRewardsArray.find(({ amount }) => amount > 0)
    )
  }
  return {
    denom: denomLookup(network.coinLookup, stringBit),
    amount: BigNumber(numBit).div(1000000)
  }
}

export const lunieMessageTypes = {
  SEND: `SendTx`,
  STAKE: `StakeTx`,
  RESTAKE: `RestakeTx`,
  UNSTAKE: `UnstakeTx`,
  VOTE: `VoteTx`,
  DEPOSIT: `DepositTx`,
  CLAIM_REWARDS: `ClaimRewardsTx`,
  SUBMIT_PROPOSAL: `SubmitProposalTx`,
  UNKNOWN: `UnknownTx`
}

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

function denomLookup(coinLookup, denom) {
  return coinLookup.find(({ chainDenom }) => chainDenom === denom)
    ? coinLookup.find(({ chainDenom }) => chainDenom === denom).viewDenom
    : chainDenom.toUpperCase()
}

function coinReducer(coin, coinLookup) {
  if (!coin) {
    return {
      amount: 0,
      denom: ''
    }
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coinLookup, coin.denom)
  return {
    denom: denom,
    amount: BigNumber(coin.amount).div(1000000).toNumber() // Danger: this might not be the case for all future tokens
  }
}

function transactionReducerV2(
  transaction,
  displayedProperties,
  reducers,
  stakingDenom,
  network
) {
  // TODO check if this is anywhere not an array
  let fees
  if (Array.isArray(transaction.tx.value.fee.amount)) {
    fees = transaction.tx.value.fee.amount.map((amount) =>
      coinReducer(amount, network.coinLookup)
    )
  } else {
    fees = [coinReducer(transaction.tx.value.fee.amount, network.coinLookup)]
  }
  // We do display only the transactions we support in Lunie
  const filteredMessages = transaction.tx.value.msg.filter(
    ({ type }) => getMessageType(type) !== 'Unknown'
  )
  const { claimMessages, otherMessages } = filteredMessages.reduce(
    ({ claimMessages, otherMessages }, message) => {
      // we need to aggregate all withdraws as we display them together in one transaction
      if (getMessageType(message.type) === lunieMessageTypes.CLAIM_REWARDS) {
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
    type: getMessageType(type),
    hash: transaction.txhash,
    height: transaction.height,
    details: transactionDetailsReducer(
      getMessageType(type),
      value,
      displayedProperties,
      reducers,
      transaction,
      stakingDenom
    ),
    timestamp: transaction.timestamp,
    memo: transaction.tx.value.memo,
    fees,
    success: transaction.logs ? transaction.logs[index].success : false
  }))
  return returnedMessages
}

// function to map cosmos messages to our details format
function transactionDetailsReducer(
  type,
  message,
  displayedProperties,
  reducers,
  transaction,
  stakingDenom
) {
  let details
  switch (type) {
    case lunieMessageTypes.SEND:
      details = sendDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.STAKE:
      details = stakeDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.RESTAKE:
      details = restakeDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.UNSTAKE:
      details = unstakeDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.CLAIM_REWARDS:
      details = claimRewardsDetailsReducer(
        message,
        displayedProperties,
        reducers,
        transaction,
        stakingDenom
      )
      break
    case lunieMessageTypes.SUBMIT_PROPOSAL:
      details = submitProposalDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.VOTE:
      details = voteProposalDetailsReducer(message, reducers)
      break
    case lunieMessageTypes.DEPOSIT:
      details = depositDetailsReducer(message, reducers)
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
    type: `type/MsgWithdrawDelegationReward`,
    value: {
      validators: onlyValidatorsAddressesArray
    }
  }
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

function claimRewardsDetailsReducer(message, displayedProperties) {
  return {
    from: message.validators,
    amounts: displayedProperties.claimableRewards
  }
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
