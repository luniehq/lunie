const { uniqWith, sortBy, reverse } = require('lodash')
const { cosmosMessageType } = require('../message-types')
const {
  cosmosWhitelistedMessageTypes,
  lunieMessageTypes
} = require('../../lib/message-types')
const BigNumber = require('bignumber.js')
const _ = require('lodash')
const Sentry = require('@sentry/node')

function proposalBeginTime(proposal) {
  switch (proposal.proposal_status.toLowerCase()) {
    case 'depositperiod':
      return proposal.submit_time
    case 'votingperiod':
      return proposal.voting_start_time
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function proposalEndTime(proposal) {
  switch (proposal.proposal_status.toLowerCase()) {
    case 'depositperiod':
      return proposal.deposit_end_time
    case 'votingperiod':
    // the end time lives in the past already if the proposal is finalized
    // eslint-disable-next-line no-fallthrough
    case 'passed':
    case 'rejected':
      return proposal.voting_end_time
  }
}

function proposalFinalized(proposal) {
  return ['Passed', 'Rejected'].indexOf(proposal.proposal_status) !== -1
}

function accountInfoReducer(accountValue, accountType) {
  if (accountType.includes(`VestingAccount`)) {
    accountValue = accountValue.BaseVestingAccount.BaseAccount
  }
  return {
    address: accountValue.address,
    accountNumber: accountValue.account_number,
    sequence: accountValue.sequence
  }
}

function atoms(nanoAtoms) {
  return BigNumber(nanoAtoms)
    .div(1000000)
    .toFixed(6)
}

const calculateTokens = (validator, shares) => {
  // this is the based on the idea that tokens should equal
  // (myShares / totalShares) * totalTokens where totalShares
  // and totalTokens are both represented as fractions
  const myShares = new BigNumber(shares || 0)
  const totalShares = new BigNumber(validator.delegatorShares)
  const totalTokens = new BigNumber(validator.tokens)

  if (totalShares.eq(0)) return new BigNumber(0)
  return myShares
    .times(totalTokens)
    .div(totalShares)
    .toFixed(6)
}

/* if you don't get this, write fabian@lunie.io */
// expected rewards if delegator stakes x tokens
const expectedRewardsPerToken = (validator, commission, annualProvision) => {
  if (validator.status === 'INACTIVE' || validator.jailed === true) {
    return 0
  }

  // share of all provisioned block rewards all delegators of this validator get
  const totalAnnualValidatorRewards = BigNumber(validator.votingPower).times(
    annualProvision
  )
  // the validator takes a cut in amount of the commission
  const totalAnnualDelegatorRewards = totalAnnualValidatorRewards.times(
    BigNumber(1).minus(commission)
  )

  // validator.tokens is the amount of all tokens delegated to that validator
  // one token delegated would receive x percentage of all delegator rewards
  const delegatorSharePerToken = BigNumber(1).div(validator.tokens)
  const annualDelegatorRewardsPerToken = totalAnnualDelegatorRewards.times(
    delegatorSharePerToken
  )
  return annualDelegatorRewardsPerToken.div(1000000)
}

// reduce deposits to one number
function getDeposit(proposal) {
  return atoms(
    proposal.total_deposit.reduce(
      (sum, cur) => sum.plus(cur.amount),
      BigNumber(0)
    )
  )
}

function getTotalVotePercentage(proposal, totalBondedTokens, totalVoted) {
  // for passed proposals we can't calculate the total voted percentage, as we don't know the totalBondedTokens in the past
  if (proposalFinalized(proposal)) return -1
  if (BigNumber(totalVoted).eq(0)) return 0
  if (!totalBondedTokens) return -1
  return BigNumber(totalVoted)
    .div(atoms(totalBondedTokens))
    .toNumber()
}

function tallyReducer(proposal, tally, totalBondedTokens) {
  // if the proposal is out of voting, use the final result for the tally
  if (proposalFinalized(proposal)) {
    tally = proposal.final_tally_result
  }

  const totalVoted = atoms(
    BigNumber(tally.yes)
      .plus(tally.no)
      .plus(tally.abstain)
      .plus(tally.no_with_veto)
  )

  return {
    yes: atoms(tally.yes),
    no: atoms(tally.no),
    abstain: atoms(tally.abstain),
    veto: atoms(tally.no_with_veto),
    total: totalVoted,
    totalVotedPercentage: getTotalVotePercentage(
      proposal,
      totalBondedTokens,
      totalVoted
    )
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
    id: Number(proposal.proposal_id),
    type: proposal.proposal_content.type,
    title: proposal.proposal_content.value.title,
    description: proposal.proposal_content.value.description,
    creationTime: proposal.submit_time,
    status: proposal.proposal_status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, tally, totalBondedTokens),
    deposit: getDeposit(proposal),
    proposer: proposer.proposer
  }
}

function governanceParameterReducer(depositParameters, tallyingParamers) {
  return {
    votingThreshold: tallyingParamers.threshold,
    vetoThreshold: tallyingParamers.veto,
    // for now assuming one deposit denom
    depositDenom: denomLookup(depositParameters.min_deposit[0].denom),
    depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
      1000000
    )
  }
}

function getValidatorStatus(validator) {
  if (validator.status === 2) {
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
    votingPower: validator.voting_power.toFixed(9),
    startHeight: validator.signing_info
      ? validator.signing_info.start_height
      : undefined,
    uptimePercentage:
      1 -
      Number(validator.signing_info.missed_blocks_counter) /
        Number(signedBlocksWindow),
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: validator.commission.rate,
    maxCommission: validator.commission.max_rate,
    maxChangeCommission: validator.commission.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares // needed to calculate delegation token amounts from shares
  }
}

function blockReducer(networkId, block, transactions) {
  return {
    networkId,
    height: block.block_meta.header.height,
    chainId: block.block_meta.header.chain_id,
    hash: block.block_meta.block_id.hash,
    time: block.block_meta.header.time,
    transactions,
    proposer_address: block.block_meta.header.proposer_address
  }
}

function denomLookup(denom) {
  const lookup = {
    uatom: 'ATOM',
    umuon: 'MUON',
    uluna: 'LUNA',
    ukrw: 'KRW',
    umnt: 'MNT',
    usdr: 'SDR',
    uusd: 'USD',
    seed: 'TREE',
    ungm: 'NGM',
    eeur: 'eEUR',
    echf: 'eCHF',
    ejpy: 'eJPY',
    eusd: 'eUSD'
  }
  return lookup[denom] ? lookup[denom] : denom.toUpperCase()
}

function coinReducer(coin) {
  if (!coin) {
    return {
      amount: 0,
      denom: ''
    }
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coin.denom)
  return {
    denom: denom,
    amount: BigNumber(coin.amount).div(1000000) // Danger: this might not be the case for all future tokens
  }
}

function gasPriceReducer(gasPrice) {
  if (!gasPrice) {
    throw new Error(
      'The token you are trying to request data for is not supported by Lunie.'
    )
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(gasPrice.denom)
  return {
    denom: denom,
    price: BigNumber(gasPrice.price).div(1000000) // Danger: this might not be the case for all future tokens
  }
}

function toMicroUnitBalance(balance) {
  return {
    amount: BigNumber(balance.amount).times(1000000),
    denom: toMicroDenom(balance.denom)
  }
}

function toMicroDenom(denom) {
  return `u`.concat(denom.toLowerCase())
}

// delegations rewards in Tendermint are located in events as strings with this form:
// amount: {"15000umuon"}, or in multidenom networks they look like this:
// amount: {"15000ungm,100000uchf,110000ueur,2000000ujpy"}
// That is why we need this separate function to extract those amounts in this format
function rewardCoinReducer(reward, stakingDenom) {
  const numBit = reward.match(/[0-9]+/gi)
  const stringBit = reward.match(/[a-z]+/gi)
  const multiDenomRewardsArray = reward.split(`,`)
  if (multiDenomRewardsArray.length > 1) {
    return multiDenomRewardsArray
      .map(reward => rewardCoinReducer(reward))
      .filter(({ denom }) => denom === denomLookup(stakingDenom))[0]
  }
  return {
    denom: denomLookup(stringBit),
    amount: BigNumber(numBit).div(1000000)
  }
}

function balanceReducer(coin, gasPrices) {
  return {
    ...coin,
    gasPrice: gasPrices
      ? gasPriceReducer(
          gasPrices.find(gasPrice => denomLookup(gasPrice.denom) === coin.denom)
        ).price
      : null
  }
}

function delegationReducer(delegation, validator) {
  // in cosmos SDK v0 we need to convert shares (cosmos internal representation) to token balance
  const balance = calculateTokens(validator, delegation.shares)

  return {
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: balance
  }
}

function undelegationReducer(undelegation, validator) {
  return {
    delegatorAddress: undelegation.delegator_address,
    validator,
    amount: atoms(undelegation.balance),
    startHeight: undelegation.creation_height,
    endTime: undelegation.completion_time
  }
}

function rewardReducer(reward, validator) {
  return {
    amount: atoms(reward.amount),
    denom: denomLookup(reward.denom),
    validator
  }
}

async function overviewReducer(
  balances,
  delegations,
  undelegations,
  rewards,
  stakingDenom,
  fiatValueAPI,
  reducers
) {
  stakingDenom = denomLookup(stakingDenom)

  const totalRewards = _.flatten(rewards)
    // this filter is here for multidenom networks. If there is the field denoms inside rewards, we filter
    // only the staking denom rewards for 'totalRewards'
    .filter(reward =>
      reward.denom ? denomLookup(reward.denom) === stakingDenom : reward
    )
    .reduce((sum, { amount }) => BigNumber(sum).plus(amount), 0)
    .toFixed(6)
  const liquidStake = BigNumber(
    (
      balances.find(({ denom }) => denomLookup(denom) === stakingDenom) || {
        amount: 0
      }
    ).amount
  )
  const delegatedStake = delegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const undelegatingStake = undelegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const totalStake = liquidStake.plus(delegatedStake).plus(undelegatingStake)

  return {
    rewards:
      // there are some accounts which are not staking and therefore have no rewards
      rewards[0]
        ? rewards[0].constructor === Array
          ? reducers.rewardReducer(rewards)
          : rewards
        : null,
    totalRewards: totalRewards,
    liquidStake: liquidStake,
    totalStake,
    totalStakeFiatValue: fiatValueAPI
      ? totalStakeFiatValueReducer(
          fiatValueAPI,
          totalStake,
          stakingDenom,
          reducers
        )
      : null
  }
}

async function totalStakeFiatValueReducer(
  fiatValueAPI,
  totalStake,
  stakingDenom
) {
  return await fiatValueAPI.calculateFiatValue(
    // we need to convert here to microunits since this is the format that calculateFiatValue is taking
    toMicroUnitBalance({
      amount: totalStake,
      denom: stakingDenom
    })
  )
}

function getGroupByType(transactionType) {
  const transactionGroup = {
    [cosmosMessageType.SEND]: 'banking',
    [cosmosMessageType.MULTI_SEND]: 'banking',
    [cosmosMessageType.CREATE_VALIDATOR]: 'staking',
    [cosmosMessageType.EDIT_VALIDATOR]: 'staking',
    [cosmosMessageType.DELEGATE]: 'staking',
    [cosmosMessageType.UNDELEGATE]: 'staking',
    [cosmosMessageType.BEGIN_REDELEGATE]: 'staking',
    [cosmosMessageType.UNJAIL]: 'staking',
    [cosmosMessageType.SUBMIT_PROPOSAL]: 'governance',
    [cosmosMessageType.DEPOSIT]: 'governance',
    [cosmosMessageType.VOTE]: 'governance',
    [cosmosMessageType.SET_WITHDRAW_ADDRESS]: 'distribution',
    [cosmosMessageType.WITHDRAW_DELEGATION_REWARD]: 'distribution',
    [cosmosMessageType.WITHDRAW_VALIDATOR_COMMISSION]: 'distribution'
  }

  return transactionGroup[transactionType] || 'unknown'
}

function undelegationEndTimeReducer(transaction) {
  if (transaction.tags) {
    if (transaction.tags.find(tx => tx.key === `end-time`)) {
      return transaction.tags.filter(tx => tx.key === `end-time`)[0].value
    }
  } else {
    return null
  }
}

function formatTransactionsReducer(txs, reducers) {
  const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  const reversedTxs = reverse(sortedTxs)
  // here we filter out all transactions related to validators
  let filteredMsgs = []
  reversedTxs.forEach(transaction => {
    transaction.tx.value.msg.forEach(msg => {
      // only push transactions messages supported by Lunie
      if (cosmosWhitelistedMessageTypes.has(msg.type.split('/')[1])) {
        filteredMsgs.push(msg)
      }
    })
    transaction.tx.value.msg = filteredMsgs
    filteredMsgs = []
  })
  return reversedTxs.map(tx => transactionReducer(tx, reducers))
}

function transactionReducerV2(transaction, reducers, stakingDenom) {
  // TODO check if this is anywhere not an array
  let fees
  if (Array.isArray(transaction.tx.value.fee.amount)) {
    fees = transaction.tx.value.fee.amount.map(coinReducer)
  } else {
    fees = [coinReducer(transaction.tx.value.fee.amount)]
  }
  // We do display only the transactions we support in Lunie
  const filteredMessages = transaction.tx.value.msg.filter(
    ({ type }) => getMessageType(type) !== 'Unknown'
  )
  const returnedMessages = filteredMessages.map(({ value, type }, index) => ({
    type: getMessageType(type),
    hash: transaction.txhash,
    height: transaction.height,
    details: transactionDetailsReducer(
      getMessageType(type),
      value,
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

function transactionsReducerV2(txs, reducers, stakingDenom) {
  const duplicateFreeTxs = uniqWith(txs, (a, b) => a.txhash === b.txhash)
  const sortedTxs = sortBy(duplicateFreeTxs, ['timestamp'])
  const reversedTxs = reverse(sortedTxs)
  // here we filter out all transactions related to validators
  return reversedTxs.reduce((collection, transaction) => {
    return collection.concat(
      transactionReducerV2(transaction, reducers, stakingDenom)
    )
  }, [])
}

// to be able to catch all validators from a multi-claim reward tx, we need to capture
// more than just the first value message.
function txMultiClaimRewardReducer(txMessages) {
  const filteredMessages = txMessages.filter(
    msg => msg.type.split('/')[1] === `MsgWithdrawDelegationReward`
  )
  return filteredMessages.length > 0 ? filteredMessages : null
}

function transactionReducer(transaction, reducers) {
  try {
    let fee = coinReducer(false)
    if (Array.isArray(transaction.tx.value.fee.amount)) {
      fee = coinReducer(transaction.tx.value.fee.amount[0])
    } else {
      fee = coinReducer(transaction.tx.value.fee.amount)
    }

    const result = {
      type: transaction.tx.value.msg[0].type,
      group: getGroupByType(transaction.tx.value.msg[0].type),
      hash: transaction.txhash,
      height: Number(transaction.height),
      timestamp: transaction.timestamp,
      gasUsed: transaction.gas_used,
      gasWanted: transaction.gas_wanted,
      success: transaction.logs ? transaction.logs[0].success : false,
      log: transaction.logs
        ? transaction.logs[0].log
        : JSON.parse(transaction.raw_log).message,
      memo: transaction.tx.value.memo,
      fee,
      signature: transaction.tx.value.signatures[0].signature,
      value: JSON.stringify(transaction.tx.value.msg[0].value),
      raw: transaction,
      withdrawValidators: JSON.stringify(
        txMultiClaimRewardReducer(transaction.tx.value.msg)
      ),
      undelegationEndTime: reducers.undelegationEndTimeReducer(transaction)
    }

    return result
  } catch (err) {
    Sentry.withScope(function(scope) {
      scope.setExtra('transaction', transaction)
      Sentry.captureException(err)
    })
    return {
      raw: transaction
    }
  }
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

// function to map cosmos messages to our details format
function transactionDetailsReducer(
  type,
  message,
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
        transaction.tx.value.msg,
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

function claimRewardsDetailsReducer(
  messages,
  reducers,
  transaction,
  stakingDenom
) {
  return {
    from: messages
      .filter(msg => msg.type.split(`/`)[1] === `MsgWithdrawDelegationReward`)
      .map(msg => msg.value.validator_address),
    amount: claimRewardsAmountReducer(transaction, reducers, stakingDenom)
  }
}

function claimRewardsAmountReducer(transaction, reducers, stakingDenom) {
  return reducers.rewardCoinReducer(
    transaction.events
      .find(event => event.type === `transfer`)
      .attributes.find(attribute => attribute.key === `amount`).value,
    stakingDenom
  )
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

// TO TEST!
function depositDetailsReducer(message, reducers) {
  return {
    proposalId: message.proposal_id,
    amount: reducers.coinReducer(message.amount)
  }
}

module.exports = {
  proposalReducer,
  governanceParameterReducer,
  tallyReducer,
  validatorReducer,
  blockReducer,
  delegationReducer,
  coinReducer,
  gasPriceReducer,
  rewardCoinReducer,
  balanceReducer,
  transactionReducer,
  undelegationReducer,
  rewardReducer,
  overviewReducer,
  accountInfoReducer,
  calculateTokens,
  undelegationEndTimeReducer,
  formatTransactionsReducer,
  transactionsReducerV2,

  atoms,
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  getTotalVotePercentage,
  getValidatorStatus,
  expectedRewardsPerToken,
  getGroupByType,
  denomLookup
}
