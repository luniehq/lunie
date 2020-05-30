const { uniqBy } = require('lodash')
const BigNumber = require('bignumber.js')

// This code mainly lives in the FE in src/components/signing/networkMessages

async function multiMessage(transactions, api) {
  return api.tx.utility.batch(transactions)
}

async function getSignMessage(senderAddress, transaction, api) {
  if (Array.isArray(transaction)) {
    if (transaction.length > 1) {
      transaction = await multiMessage(transaction, api)
    } else {
      transaction = transaction[0]
    }
  }

  const nonce = (await api.derive.balances.account(senderAddress)).accountNonce
  let options
  let blockNumber

  // Get current block if we want to modify the number of blocks we have to sign
  const signedBlock = await api.rpc.chain.getBlock()
  options = {
    blockHash: signedBlock.block.header.hash,
    era: api.createType('ExtrinsicEra', {
      current: signedBlock.block.header.number,
      period: 50
    }),
    nonce
  }
  blockNumber = signedBlock.block.header.number

  const payload = api.createType('SignerPayload', {
    version: api.extrinsicVersion,
    runtimeVersion: api.runtimeVersion,
    genesisHash: api.genesisHash,
    ...options,
    address: senderAddress,
    method: transaction.method,
    blockNumber
  })

  return { payload, transaction }
}

// Bank
/* istanbul ignore next */
async function SendTx(senderAddress, { to, amount }, network, api) {
  return await getSignMessage(
    senderAddress,
    api.tx.balances.transfer(to[0], toChainAmount(amount, network.coinLookup)),
    api
  )
}

// Staking
async function StakeTx(
  senderAddress,
  { to, amount, addressRole },
  network,
  api
) {
  // stake with all existing plus the selected
  const transactions = []

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

  if (to.length > 0) {
    if (addressRole === 'none') {
      transactions.push(await api.tx.staking.nominate(to))
    } else if (['controller', 'stash/controller'].includes(addressRole)) {
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
    throw new Error('You have to either bond stake or nominate a new validator')
  }
  return await getSignMessage(senderAddress, transactions, api)
}
async function UnstakeTx(
  senderAddress,
  { from, amount, addressRole },
  network,
  api
) {
  // stake with all existing plus the selected
  const transactions = []

  if (amount.amount > 0) {
    const chainAmount = toChainAmount(amount, network.coinLookup)
    transactions.push(await api.tx.staking.unbond(chainAmount))
  }

  // Disable if address is a controller account
  if (
    from.length > 0 &&
    ['controller', 'stash/controller'].includes(addressRole)
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

async function RestakeTx(senderAddress, { to, from, addressRole }, api) {
  // stake with all existing plus the selected
  const transactions = []
  // validators you continue nominating
  if (
    to.length > 0 &&
    from.length > 0 &&
    ['controller', 'stash/controller'].includes(addressRole)
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

async function ClaimRewardsTx(senderAddress, api) {
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
    throw new Error('There are no claimable rewards')
  }
  return await getSignMessage(senderAddress, allClaimingTxs, api)
}

function toChainAmount({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  const chainAmount = BigNumber(amount)
    .dividedBy(lookup.chainToViewConversionFactor)
    .toFixed()

  return chainAmount
}

module.exports = {
  SendTx,
  StakeTx,
  UnstakeTx,
  ClaimRewardsTx,
  RestakeTx
}
