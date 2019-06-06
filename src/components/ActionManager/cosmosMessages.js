import { getTop5Delegations } from "../../utils"
import transaction from "./transactionTypes"
import { uatoms } from "scripts/num.js"

function fmtSendArguments(context, { toAddress, amount, denom }) {
  return { toAddress, amounts: convertCurrencyData([{ amount, denom }]) }
}

// If given a single address, withdraw from there,
// else assume the user wants to withdraw from all the validators.
// Note: The total number of transactions could exceed the size
// limitation of the block, so we pick the top 5 rewards and inform the user.
function fmtWithdrawArguments(context, { validatorAddress }) {
  let validatorAddresses
  if (validatorAddress) {
    validatorAddresses = [validatorAddress]
  } else {
    const top5Delegations = getTop5Delegations(context.committedDelegations)
    validatorAddresses = Object.keys(top5Delegations)
  }

  return { validatorAddresses }
}

function fmtDelegateArguments(context, { validatorAddress, amount, denom }) {
  return {
    validator_address: validatorAddress,
    amount: toMicroAtomString(amount),
    denom
  }
}

function fmtUndelegateArguments(context, { validatorAddress, amount, denom }) {
  return {
    validator_address: validatorAddress,
    amount: toMicroAtomString(amount),
    denom
  }
}

function fmtRedelegateArguments(
  context,
  { validatorSrc, validatorDst, amount, denom }
) {
  return {
    validator_src_address: validatorSrc,
    validator_dst_address: validatorDst,
    amount: toMicroAtomString(amount),
    denom
  }
}

function fmtSubmitProposalArguments(
  context,
  { proposalType, title, description, denom, amount }
) {
  return {
    proposalType,
    title,
    description,
    initialDeposits: convertCurrencyData([{ amount, denom }])
  }
}

function fmtVoteArguments(context, { proposalId, option }) {
  return { proposalId, option }
}

function fmtDepositArguments(context, { proposalId, amounts }) {
  return {
    proposalId,
    amounts: convertCurrencyData(amounts)
  }
}

export function formatCosmosArguments(
  context,
  type,
  properties,
  simulation = false
) {
  let tx
  switch (type) {
    case transaction.SEND:
      tx = fmtSendArguments(context, properties)
      break
    case transaction.WITHDRAW:
      tx = fmtWithdrawArguments(context, properties)
      break
    case transaction.DELEGATE:
      tx = fmtDelegateArguments(context, properties)
      break
    case transaction.UNDELEGATE:
      tx = fmtUndelegateArguments(context, properties)
      break
    case transaction.REDELEGATE:
      tx = fmtRedelegateArguments(context, properties)
      break
    case transaction.SUBMIT_PROPOSAL:
      tx = fmtSubmitProposalArguments(context, properties)
      break
    case transaction.VOTE:
      tx = fmtVoteArguments(context, properties)
      break
    case transaction.DEPOSIT:
      tx = fmtDepositArguments(context, properties)
      break
    default:
      tx = null
  }

  // When simulating a withdrawal, ignore validator addresses
  if (type === transaction.WITHDRAW && simulation && tx) {
    tx = {
      ...tx,
      validatorAddresses: []
    }
  }

  return tx
}

export function convertCurrencyData(amounts) {
  return amounts.map(({ amount, denom }) => ({
    amount: toMicroAtomString(amount),
    denom
  }))
}

function toMicroAtomString(amount) {
  return String(uatoms(amount))
}
