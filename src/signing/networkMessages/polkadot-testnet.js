import { getSignMessage, getAPI } from "./polkadot-transactions"
import uniqBy from "lodash.uniqby"
import BigNumber from "bignumber.js"

// Bank
/* istanbul ignore next */
export async function SendTx(senderAddress, { to, amount }, network) {
  const api = await getAPI()

  return await getSignMessage(
    senderAddress,
    api.tx.balances.transfer(to[0], toChainAmount(amount, network.coinLookup))
  )
}

// Staking
export async function StakeTx(senderAddress, { to, amount }, network) {
  // stake with all existing plus the selected
  const api = await getAPI()
  const transactions = []

  // Check if controller is already set
  const controller = await api.query.staking.bonded(senderAddress)

  const chainAmount = toChainAmount(amount, network.coinLookup)
  if (controller.toString() === `` && amount > 0) {
    const payee = 0
    transactions.push(
      await api.tx.staking.bond(senderAddress, chainAmount, payee)
    )
  } else {
    transactions.push(await api.tx.staking.bondExtra(chainAmount))
  }

  const response = await api.query.staking.nominators(senderAddress)
  const { targets: delegatedValidators = [] } = response.toJSON() || {}
  const validatorAddresses = uniqBy(delegatedValidators.concat(to[0]), x => x)
  transactions.push(await api.tx.staking.nominate(validatorAddresses))
  if (transactions.length === 0) {
    throw new Error("You have to either bond stake or nominate a new validator")
  }
  return await getSignMessage(senderAddress, transactions)
}

export async function ClaimRewardsTx(
  senderAddress,
  {
    // amounts,
    from
  }
) {
  const api = await getAPI()
  const [currentEra, oldestClaimableEra, stakingInfo] = await Promise.all([
    api.query.staking.historyDepth(),
    api.query.staking.currentEra(),
    api.derive.staking.query(senderAddress)
  ])
  let claimedRewards
  if (
    !stakingInfo.stakingLedger ||
    !stakingInfo.stakingLedger.claimedRewards ||
    stakingInfo.stakingLedger.claimedRewards.length === 0
  ) {
    claimedRewards = []
  } else {
    claimedRewards = stakingInfo.stakingLedger.claimedRewards.toHuman()
  }
  // No claimed rewards yet so we substract HISTORY_DEPTH to current era index
  const claimRewardsSinceEra =
    parseInt(currentEra) - parseInt(oldestClaimableEra)

  const allClaimingTxs = []
  for (let era = claimRewardsSinceEra; era <= currentEra; era++) {
    if (!claimedRewards.included(era)) {
      allClaimingTxs.push(api.tx.staking.payoutNominator(era, from))
    }
  }

  if (allClaimingTxs.length === 0) {
    throw new Error("There are no claimable rewards")
  }
  return getSignMessage(senderAddress, allClaimingTxs)
}

function toChainAmount({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  const chainAmount = BigNumber(amount)
    .dividedBy(lookup.chainToViewConversionFactor)
    .toFixed()

  return chainAmount
}
