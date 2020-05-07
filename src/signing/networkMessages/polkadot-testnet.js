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

export async function ClaimRewardsTx(senderAddress) {
  let allClaimingTxs = []
  const api = await getAPI()
  const stakerRewards = await api.derive.staking.stakerRewards(senderAddress)

  if (stakerRewards.length === 0) {
    allClaimingTxs = []
  } else {
    stakerRewards.forEach(reward => {
      reward.nominating.forEach(nomination => {
        if (reward.isStakerPayout) {
          allClaimingTxs.push(
            api.tx.staking.payoutStakers(nomination.validatorId, reward.era)
          )
        } else {
          const validators = reward.nominating.map(
            ({ validatorId, validatorIndex }) => [validatorId, validatorIndex]
          )
          allClaimingTxs.push(
            api.tx.staking.payoutNominator(reward.era, validators)
          )
        }
      })
    })
  }
  if (allClaimingTxs.length === 0) {
    throw new Error("There are no claimable rewards")
  }
  return await getSignMessage(senderAddress, allClaimingTxs)
}

function toChainAmount({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  const chainAmount = BigNumber(amount)
    .dividedBy(lookup.chainToViewConversionFactor)
    .toFixed()

  return chainAmount
}
