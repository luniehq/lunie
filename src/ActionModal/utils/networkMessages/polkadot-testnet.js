import { getSignMessage, getAPI } from "./polkadot-transactions"
import uniqBy from "lodash.uniqby"

// Bank
/* istanbul ignore next */
export async function MsgSend(
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
export async function MsgDelegate(senderAddress, { validatorAddress, amount }) {
  // stake with all existing plus the selected
  const api = await getAPI()
  const transactions = []

  // if we have not bonded to a controller account we do that first
  const controllerAccount = await api.query.staking.bonded(senderAddress)
  if (!controllerAccount) {
    transactions.push(await api.tx.staking.bond(senderAddress, amount))
  } else {
    // if already bonded, add more stake if desired
    if (amount > 0) {
      transactions.push(await api.tx.staking.bondExtra(amount))
    }
  }

  const response = await api.query.staking.nominators(senderAddress)
  const { targets: delegatedValidators = [] } = response.toJSON() || {}
  if (
    !delegatedValidators.find(
      delegatedValidators => delegatedValidators === validatorAddress
    )
  ) {
    const validatorAddresses = uniqBy(
      delegatedValidators.concat(validatorAddress),
      x => x
    )
    transactions.push(await api.tx.staking.nominate(validatorAddresses))
  }
  if (transactions.length === 0) {
    throw new Error("You have to either bond stake or nominate a new validator")
  }
  return await getSignMessage(senderAddress, transactions)
}
