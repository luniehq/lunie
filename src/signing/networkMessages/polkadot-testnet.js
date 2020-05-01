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

export async function ClaimRewardsTx(senderAddress, { from }) {
  let allClaimingTxs = []
  const api = await getAPI()
  const [currentEra, stakingInfo] = await Promise.all([
    api.query.staking.currentEra(),
    api.derive.staking.query(senderAddress)
  ])

  if (
    !stakingInfo.stakingLedger ||
    !stakingInfo.stakingLedger.claimedRewards ||
    stakingInfo.stakingLedger.claimedRewards.length === 0
  ) {
    allClaimingTxs = []
  } else {
    const claimedRewards = stakingInfo.stakingLedger.claimedRewards.toHuman()
    const oldestClaimableEra = parseInt(Math.max(...claimedRewards)) + 1

    console.log(`currentEra:`, currentEra)
    console.log(`claimedRewards:`, claimedRewards)
    console.log(`oldestClaimableEra:`, oldestClaimableEra)

    console.log(`Claim rewards from ${oldestClaimableEra} to ${currentEra - 1}`)

    for (let era = oldestClaimableEra; era < currentEra; era++) {
      // allClaimingTxs.push(api.tx.staking.payoutNominator(era, from))
      allClaimingTxs.push(`api.tx.staking.payoutNominator(${era}, ${from})`)
    }
  }
  console.log(`allClaimingTxs:`, allClaimingTxs)
  return true

  // if (allClaimingTxs.length === 0) {
  // throw new Error("There are no claimable rewards")
  // }
  // return getSignMessage(senderAddress, allClaimingTxs)
}

function toChainAmount({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  const chainAmount = BigNumber(amount)
    .dividedBy(lookup.chainToViewConversionFactor)
    .toFixed()

  return chainAmount
}
