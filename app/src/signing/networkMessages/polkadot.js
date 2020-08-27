import { getSignMessage } from "./polkadot-transactions"
import uniqBy from "lodash.uniqby"
import BigNumber from "bignumber.js"

// Bank
/* istanbul ignore next */
export async function SendTx(senderAddress, { to, amount }, network, api) {
  return await getSignMessage(
    senderAddress,
    api.tx.balances.transfer(to[0], toChainAmount(amount, network.coinLookup)),
    api
  )
}

// Staking
export async function StakeTx(
  senderAddress,
  { to, amount, addressRole },
  network,
  api
) {
  // stake with all existing plus the selected
  const transactions = []
  // delegation amount
  if (amount.amount > 0) {
    const chainAmount = toChainAmount(amount, network.coinLookup)
    const payee = 0

    if (addressRole === `stash/controller` || addressRole === `stash`) {
      transactions.push(await api.tx.staking.bondExtra(chainAmount))
    }
    if (addressRole === `none`) {
      // bonds the stash address as a controller of this account
      // there has to be a controller set for staking actions
      transactions.push(
        await api.tx.staking.bond(senderAddress, chainAmount, payee)
      )
    }
    // controllers can't bond stake
  }
  // validator you are delegating to
  if (to.length > 0) {
    if (addressRole === "none") {
      transactions.push(await api.tx.staking.nominate(to))
      // only controller addresses can nominate (for not set controllers, we set the controller above)
    } else if (["controller", "stash/controller"].includes(addressRole)) {
      const stakingLedger = await api.query.staking.ledger(senderAddress)
      const stashId = stakingLedger.toJSON().stash
      const response = await api.query.staking.nominators(stashId)
      const { targets: delegatedValidators = [] } = response.toJSON() || {}
      const validatorAddresses = uniqBy(
        delegatedValidators.concat(to[0]),
        (x) => x
      )
      transactions.push(await api.tx.staking.nominate(validatorAddresses))
    }
  }

  if (transactions.length === 0) {
    throw new Error("You have to either bond stake or nominate a new validator")
  }
  return await getSignMessage(senderAddress, transactions, api)
}

export async function UnstakeTx(
  senderAddress,
  { from, amount, addressRole },
  network,
  api
) {
  // stake with all existing plus the selected
  const transactions = []
  // undelegation amount
  if (amount.amount > 0) {
    const chainAmount = toChainAmount(amount, network.coinLookup)
    transactions.push(await api.tx.staking.unbond(chainAmount))
  }
  // validator you are undelegating from
  // Disable if address is a controller account
  if (
    from.length > 0 &&
    ["controller", "stash/controller"].includes(addressRole)
  ) {
    const stakingLedger = await api.query.staking.ledger(senderAddress)
    const stashId = stakingLedger.toJSON().stash
    const response = await api.query.staking.nominators(stashId)
    const { targets: delegatedValidators = [] } = response.toJSON() || {}
    const validatorAddresses = delegatedValidators.filter(
      (validator) => !from.includes(validator)
    )
    if (validatorAddresses.length > 0) {
      transactions.push(await api.tx.staking.nominate(validatorAddresses))
    } else {
      transactions.push(await api.tx.staking.chill())
    }
  }
  return await getSignMessage(senderAddress, transactions, api)
}

export async function RestakeTx(
  senderAddress,
  { to, from, addressRole },
  network,
  api
) {
  // stake with all existing plus the selected
  const transactions = []
  // validators you continue nominating
  if (
    to.length > 0 &&
    from.length > 0 &&
    ["controller", "stash/controller"].includes(addressRole)
  ) {
    // only controller addresses can nominate (for not set controllers, we set the controller above)
    const stakingLedger = await api.query.staking.ledger(senderAddress)
    const stashId = stakingLedger.toJSON().stash
    const response = await api.query.staking.nominators(stashId)
    const { targets: delegatedValidators = [] } = response.toJSON() || {}
    const validatorAddresses = delegatedValidators
      .filter((validator) => !from.includes(validator))
      .concat(to[0])
    transactions.push(await api.tx.staking.nominate(validatorAddresses))
  }
  return await getSignMessage(senderAddress, transactions, api)
}

export async function ClaimRewardsTx(senderAddress, {}, network, api) {
  let allClaimingTxs = []
  const stakerRewards = await api.derive.staking.stakerRewards(senderAddress)
  const newStakerRewards = stakerRewards.filter(({ era }) => era.toJSON() > 718)
  if (newStakerRewards.length === 0) {
    allClaimingTxs = []
  } else {
    newStakerRewards.forEach((reward) => {
      reward.nominating.forEach((nomination) => {
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
  return await getSignMessage(senderAddress, allClaimingTxs, api)
}

// Vote
export async function VoteTx(
  senderAddress,
  { proposalId, lockedBalance, voteOption, timeLock },
  network,
  api
) {
  const referendumId = proposalId
  const voteTx = await api.tx.democracy.vote(referendumId, {
    Standard: {
      balance: toChainAmount(
        { amount: lockedBalance, denom: network.stakingDenom },
        network.coinLookup
      ),
      vote: { aye: voteOption === "Yes" ? true : false, conviction: timeLock },
    },
  })
  return await getSignMessage(senderAddress, voteTx, api)
}

function toChainAmount({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  const chainAmount = BigNumber(amount)
    .dividedBy(lookup.chainToViewConversionFactor)
    .toFixed()

  return chainAmount
}
