const BigNumber = require('bignumber.js')
const { encodeB32, decodeB32 } = require('../tools')
const { fixDecimalsAndRoundUp } = require('../../common/numbers.js')
const { getProposalSummary } = require('./common')
const {
  getMessageTitle,
  getPushLink,
  getIcon
} = require('../notifications/notifications')
/**
 * Modify the following reducers with care as they are used for ./cosmosV2-reducer.js as well
 * [proposalBeginTime, proposalEndTime, getDeposit, tallyReducer, atoms, getValidatorStatus, coinReducer]
 */

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
    sequence: accountValue.sequence || 0,
    vestingAccount: accountType.includes(`VestingAccount`)
  }
}

function atoms(nanoAtoms) {
  return BigNumber(nanoAtoms).div(1000000).toFixed(6)
}

const calculateTokens = (validator, shares) => {
  // this is the based on the idea that tokens should equal
  // (myShares / totalShares) * totalTokens where totalShares
  // and totalTokens are both represented as fractions
  const myShares = new BigNumber(shares || 0)
  const totalShares = new BigNumber(validator.delegatorShares)
  const totalTokens = new BigNumber(validator.tokens)

  if (totalShares.eq(0)) return new BigNumber(0)
  return myShares.times(totalTokens).div(totalShares).toFixed(6)
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
  return Number(
    BigNumber(totalVoted).div(atoms(totalBondedTokens)).toNumber().toFixed(6)
  )
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

function depositReducer(deposit, network, store) {
  const coinLookup = network.getCoinLookup(network, network.stakingDenom)
  return {
    id: deposit.depositor,
    amount: [coinReducer(deposit.amount[0], coinLookup)],
    depositer: networkAccountReducer(deposit.depositor, store.validators)
  }
}

function voteReducer(vote, store) {
  return {
    id: String(vote.proposal_id.concat(`_${vote.voter}`)),
    voter: networkAccountReducer(vote.voter, store.validators),
    option: vote.option
  }
}

function networkAccountReducer(address, validators) {
  const proposerValAddress = address
    ? encodeB32(decodeB32(address), `cosmosvaloper`, `hex`)
    : ''
  const validator =
    validators && proposerValAddress.length > 0
      ? validators[proposerValAddress]
      : undefined
  return {
    name: validator ? validator.name : undefined,
    address: address || '',
    picture: validator ? validator.picture : '',
    validator
  }
}

function proposalReducer(
  networkId,
  proposal,
  tally,
  proposer,
  totalBondedTokens,
  detailedVotes,
  validators
) {
  return {
    id: Number(proposal.proposal_id),
    proposalId: String(proposal.proposal_id),
    networkId,
    type: proposal.proposal_content.type,
    title: proposal.proposal_content.value.title,
    description: proposal.content.value.changes
      ? `Parameter: ${JSON.stringify(
          proposal.proposal_content.value.changes,
          null,
          4
        )}`
      : `` + `\nDescription: ${proposal.proposal_content.value.description}`,
    creationTime: proposal.submit_time,
    status: proposal.proposal_status,
    statusBeginTime: proposalBeginTime(proposal),
    statusEndTime: proposalEndTime(proposal),
    tally: tallyReducer(proposal, tally, totalBondedTokens),
    deposit: getDeposit(proposal),
    proposer: proposer
      ? networkAccountReducer(proposer.proposer, validators)
      : undefined,
    summary: getProposalSummary(proposal.proposal_content.type),
    detailedVotes
  }
}

function governanceParameterReducer(
  depositParameters,
  tallyingParamers,
  network
) {
  return {
    votingThreshold: tallyingParamers.threshold,
    vetoThreshold: tallyingParamers.veto,
    // for now assuming one deposit denom
    depositDenom: denomLookup(
      network.coinLookup,
      depositParameters.min_deposit[0].denom
    ),
    depositThreshold: BigNumber(depositParameters.min_deposit[0].amount).div(
      1000000
    )
  }
}

function topVoterReducer(topVoter) {
  return {
    name: topVoter.name,
    address: topVoter.operatorAddress,
    votingPower: topVoter.votingPower,
    picture: topVoter.picture,
    validator: topVoter
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
    uptimePercentage:
      validator.signing_info &&
      validator.signing_info.missed_blocks_counter &&
      signedBlocksWindow
        ? 1 -
          Number(
            validator.signing_info
              ? validator.signing_info.missed_blocks_counter
              : 0
          ) /
            Number(signedBlocksWindow)
        : undefined,
    tokens: atoms(validator.tokens),
    commissionUpdateTime: validator.commission.update_time,
    commission: validator.commission.rate,
    maxCommission: validator.commission.max_rate,
    maxChangeCommission: validator.commission.max_change_rate,
    status: statusInfo.status,
    statusDetailed: statusInfo.status_detailed,
    delegatorShares: validator.delegator_shares, // needed to calculate delegation token amounts from shares
    popularity: validator.popularity,
    totalStakedAssets: {
      ...fiatValuesResponse,
      amount: fiatValuesResponse.amount.toFixed(2)
    }
  }
}

function validatorProfileReducer(
  validator,
  validatorProfile,
  numberStakers,
  network
) {
  return {
    ...validator,
    profile: {
      name: validator.name,
      rank: validator.rank,
      nationality: validatorProfile ? validatorProfile.nationality : undefined,
      headerImage: validatorProfile ? validatorProfile.headerImage : undefined,
      description: validator.description,
      teamMembers: validatorProfile
        ? JSON.parse(validatorProfile.teamMembers)
        : undefined,
      socialLinks: {
        website: validatorProfile ? validatorProfile.website : undefined,
        telegram: validatorProfile ? validatorProfile.telegram : undefined,
        github: validatorProfile ? validatorProfile.github : undefined,
        twitter: validatorProfile ? validatorProfile.twitter : undefined,
        blog: validatorProfile ? validatorProfile.blog : undefined
      },
      numberStakers,
      uptimePercentage: validator.uptimePercentage,
      contributionLinks: JSON.parse(validatorProfile.contributionLinks),
      network
    }
  }
}

function blockReducer(networkId, block, transactions, data = {}) {
  return {
    id: block.block_meta.block_id.hash,
    networkId,
    height: block.block_meta.header.height,
    chainId: block.block_meta.header.chain_id,
    hash: block.block_meta.block_id.hash,
    time: block.block_meta.header.time,
    transactions,
    proposer_address: block.block_meta.header.proposer_address,
    data: JSON.stringify(data)
  }
}

function denomLookup(coinLookup, denom) {
  if (
    Array.isArray(coinLookup) &&
    coinLookup.find(({ chainDenom }) => chainDenom === denom)
  ) {
    return coinLookup.find(({ chainDenom }) => chainDenom === denom).viewDenom
  }
  return coinLookup.viewDenom ? coinLookup.viewDenom : denom.toUpperCase()
}

function coinReducer(coin, coinLookup) {
  if (!coin) {
    return {
      amount: 0,
      denom: ''
    }
  }

  if (!coinLookup) {
    return {
      amount: -1,
      denom: '[UNSUPPORTED] ' + coin.denom
    }
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coinLookup, coin.denom)

  return {
    denom: denom,
    amount: BigNumber(coin.amount).times(
      coinLookup.chainToViewConversionFactor || 6
    )
  }
}

function gasPriceReducer(gasPrice, coinLookup) {
  if (!gasPrice) {
    throw new Error(
      'The token you are trying to request data for is not supported by Lunie.'
    )
  }

  // we want to show only atoms as this is what users know
  const denom = denomLookup(coinLookup, gasPrice.denom)
  return {
    denom: denom,
    price: BigNumber(gasPrice.price)
      .times(
        coinLookup.find(({ chainDenom }) => chainDenom === gasPrice.denom)
          .chainToViewConversionFactor
      )
      .toNumber()
  }
}

// delegations rewards in Tendermint are located in events as strings with this form:
// amount: {"15000umuon"}, or in multidenom networks they look like this:
// amount: {"15000ungm,100000uchf,110000ueur,2000000ujpy"}
// That is why we need this separate function to extract those amounts in this format
function rewardCoinReducer(reward, network) {
  const multiDenomRewardsArray = reward.split(`,`)
  const mappedMultiDenomRewardsArray = multiDenomRewardsArray.map((reward) => {
    const denom = denomLookup(network.coinLookup, reward.match(/[a-z]+/gi)[0])
    const coinLookup = network.getCoinLookup(network, denom, `viewDenom`)
    return {
      denom,
      amount: BigNumber(reward.match(/[0-9]+/gi)).times(
        coinLookup.chainToViewConversionFactor
      )
    }
  })
  return mappedMultiDenomRewardsArray
}

async function balanceReducer(
  coin,
  gasPrices,
  fiatValue,
  fiatCurrency,
  network
) {
  return {
    id: coin.denom,
    ...coin,
    fiatValue,
    gasPrice: gasPrices
      ? gasPriceReducer(
          gasPrices.find(
            (gasPrice) =>
              denomLookup(network.coinLookup, gasPrice.denom) === coin.denom
          ),
          network.coinLookup
        ).price
      : null
  }
}

async function balanceV2Reducer(
  lunieCoin,
  stakingDenom,
  delegations,
  undelegations,
  fiatValueAPI,
  fiatCurrency,
  address
) {
  const isStakingDenom = lunieCoin.denom === stakingDenom
  const delegatedStake = delegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const undelegatingStake = undelegations.reduce(
    (sum, { amount }) => BigNumber(sum).plus(amount),
    0
  )
  const total = isStakingDenom
    ? BigNumber(lunieCoin.amount).plus(delegatedStake).plus(undelegatingStake)
    : lunieCoin.amount
  const fiatValue = await fiatValueAPI.calculateFiatValues(
    [
      {
        ...lunieCoin,
        amount: total
      }
    ],
    fiatCurrency
  )
  const availableFiatValue = await fiatValueAPI.calculateFiatValues(
    [lunieCoin],
    fiatCurrency
  )
  return {
    id: lunieCoin.denom,
    type: isStakingDenom ? 'STAKE' : 'CURRENCY',
    total,
    denom: lunieCoin.denom,
    fiatValue: fiatValue[lunieCoin.denom],
    available: lunieCoin.amount,
    staked: delegatedStake.amount || 0,
    availableFiatValue: availableFiatValue[stakingDenom]
  }
}

function delegationReducer(delegation, validator, active) {
  // in cosmos SDK v0 we need to convert shares (cosmos internal representation) to token balance
  const balance = calculateTokens(validator, delegation.shares)

  return {
    // id: delegation.validator_address.concat(`-${balance.denom}`),
    id: delegation.validator_address,
    validatorAddress: delegation.validator_address,
    delegatorAddress: delegation.delegator_address,
    validator,
    amount: balance,
    active
  }
}

function undelegationReducer(undelegation, validator) {
  return {
    id: `${validator.operatorAddress}_${undelegation.creation_height}`,
    delegatorAddress: undelegation.delegator_address,
    validator,
    amount: atoms(undelegation.balance),
    startHeight: undelegation.creation_height,
    endTime: undelegation.completion_time
  }
}

async function reduceFormattedRewards(
  reward,
  validator,
  fiatCurrency,
  calculateFiatValue,
  reducers,
  multiDenomRewardsArray,
  network
) {
  await Promise.all(
    reward.map(async (denomReward) => {
      const coinLookup = network.getCoinLookup(network, denomReward.denom)
      const lunieCoin = reducers.coinReducer(denomReward, coinLookup)
      if (lunieCoin.amount < 0.000001) return

      const fiatValue = calculateFiatValue
        ? await calculateFiatValue(lunieCoin, fiatCurrency)
        : undefined
      multiDenomRewardsArray.push({
        id: `${validator.operatorAddress}_${lunieCoin.denom}_${fiatCurrency}`,
        denom: lunieCoin.denom,
        amount: fixDecimalsAndRoundUp(lunieCoin.amount, 6).toString(), // TODO: refactor using a decimals number from coinLookup
        fiatValue,
        validator
      })
    })
  )
}

async function rewardReducer(
  rewards,
  validatorsDictionary,
  fiatCurrency,
  calculateFiatValue,
  reducers,
  network
) {
  const formattedRewards = rewards.map((reward) => ({
    reward: reward.reward,
    validator: validatorsDictionary[reward.validator_address]
  }))
  let multiDenomRewardsArray = []
  await Promise.all(
    formattedRewards.map(({ reward, validator }) =>
      reduceFormattedRewards(
        reward,
        validator,
        fiatCurrency,
        calculateFiatValue,
        reducers,
        multiDenomRewardsArray,
        network
      )
    )
  )
  return multiDenomRewardsArray
}

function extractInvolvedAddresses(transaction) {
  // If the transaction has failed, it doesn't get tagged
  if (!Array.isArray(transaction.tags)) return []

  const involvedAddresses = transaction.tags.reduce((addresses, tag) => {
    // temporary in here to identify why this fails
    if (!tag.value) {
      return addresses
    }
    if (tag.value.startsWith(`cosmos`)) {
      addresses.push(tag.value)
    }
    return addresses
  }, [])
  return involvedAddresses
}

function notificationReducer(notification, networks) {
  return {
    id: notification.id,
    networkId: notification.networkId,
    timestamp: notification.created_at,
    title: getMessageTitle(networks, notification),
    link: getPushLink(networks, notification),
    icon: getIcon(notification)
  }
}

module.exports = {
  proposalReducer,
  networkAccountReducer,
  governanceParameterReducer,
  topVoterReducer,
  tallyReducer,
  depositReducer,
  voteReducer,
  validatorReducer,
  validatorProfileReducer,
  blockReducer,
  delegationReducer,
  coinReducer,
  gasPriceReducer,
  rewardCoinReducer,
  balanceReducer,
  balanceV2Reducer,
  undelegationReducer,
  rewardReducer,
  accountInfoReducer,
  calculateTokens,
  notificationReducer,

  atoms,
  proposalBeginTime,
  proposalEndTime,
  getDeposit,
  getTotalVotePercentage,
  getValidatorStatus,
  expectedRewardsPerToken,
  denomLookup,
  extractInvolvedAddresses,
  getProposalSummary
}
