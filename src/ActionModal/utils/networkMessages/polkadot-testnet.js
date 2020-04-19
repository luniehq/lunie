import { getSignMessage, getAPI } from "./polkadot-transactions"
import uniqBy from "lodash.uniqby"

// Bank
/* istanbul ignore next */
export async function SendTx(
  senderAddress,
  {
    toAddress,
    amounts // [{ denom, amount}]
  }
) {
  const api = await getAPI()
  return await getSignMessage(
    senderAddress,
    api.tx.balances.transfer(toAddress, amounts[0].amount)
  )
}

// Staking
export async function StakeTx(senderAddress, { validatorAddress, amount }) {
  // stake with all existing plus the selected
  const api = await getAPI()
  const transactions = []

  // Check if controller is already set
  const controller = await api.query.staking.bonded(senderAddress)

  if (controller.toString() === `` && amount > 0) {
    const payee = 0
    transactions.push(await api.tx.staking.bond(senderAddress, amount, payee))
  } else {
    transactions.push(await api.tx.staking.bondExtra(amount))
  }

  const response = await api.query.staking.nominators(senderAddress)
  const { targets: delegatedValidators = [] } = response.toJSON() || {}
  const validatorAddresses = uniqBy(
    delegatedValidators.concat(validatorAddress),
    x => x
  )
  transactions.push(await api.tx.staking.nominate(validatorAddresses))
  if (transactions.length === 0) {
    throw new Error("You have to either bond stake or nominate a new validator")
  }
  return await getSignMessage(senderAddress, transactions)
}
