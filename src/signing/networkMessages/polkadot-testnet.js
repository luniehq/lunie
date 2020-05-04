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
  console.time("rewards")
  const [desiredEras, stakingInfo] = await Promise.all([
    api.derive.staking
      .erasHistoric(false)
      .then(rawEras => rawEras.map(rawEra => rawEra.toJSON())),
    api.derive.staking.query(senderAddress)
  ])
  let claimedRewards = []
  if (stakingInfo.stakingLedger && stakingInfo.stakingLedger.claimedRewards) {
    claimedRewards = stakingInfo.stakingLedger.claimedRewards.toJSON() || []
  }
  const claimableEras = desiredEras.filter(era => !claimedRewards.includes(era))
  const clippedExposures = await claimableEras.reduce(
    async (clippedExposuresPromise, era) => {
      const clippedExposure = await clippedExposuresPromise
      clippedExposure[era] = clippedExposure[era] || []
      clippedExposure[era].push(
        ...(await Promise.all(
          from.map(validator =>
            api.query.staking
              .erasStakersClipped(era, validator)
              .then(res => res.toJSON())
              .then(exposure => ({
                ...exposure,
                validator
              }))
          )
        ))
      )
      return clippedExposure
    },
    {}
  )
  const claimableRewards = Object.entries(clippedExposures).reduce(
    (claimableRewards, [era, exposures]) => {
      exposures.forEach(({ others, validator }) => {
        const index = others.findIndex(({ who }) => who === senderAddress)
        if (index > -1) {
          claimableRewards[era] = claimableRewards[era] || []
          claimableRewards[era].push([validator, index])
        }
      })
      return claimableRewards
    },
    {}
  )

  Object.entries(claimableRewards)
    .filter(([, validators]) => validators.length > 0)
    .sort((a, b) => a[0] - b[0])
    .forEach(([era, validators]) => {
      allClaimingTxs.push(api.tx.staking.payoutStakers(validators[0], era))
    })
  console.timeEnd("rewards")
  console.log(allClaimingTxs)
  if (allClaimingTxs.length === 0) {
    throw new Error("There are no claimable rewards")
  }
  return await getSignMessage(senderAddress, allClaimingTxs[0])
}

function toChainAmount({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  const chainAmount = BigNumber(amount)
    .dividedBy(lookup.chainToViewConversionFactor)
    .toFixed()

  return chainAmount
}
