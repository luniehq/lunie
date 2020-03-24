import { getSignMessage, getAPI } from "./polkadot-transactions"

// Bank
/* istanbul ignore next */
export async function MsgSend(
  senderAddress,
  {
    toAddress,
    amounts // [{ denom, amount}]
  }
) {
  return await getSignMessage(senderAddress, "balances", "transfer", [
    toAddress,
    amounts[0].amount
  ])
}

// Staking
export async function MsgDelegate(senderAddress, { validatorAddress }) {
  // stake with all existing plus the selected
  const api = await getAPI()
  const { targets: delegatedValidators } = await api.staking.nominators(
    senderAddress
  )
  const validatorAddresses = delegatedValidators.concat(validatorAddress)
  return await getSignMessage("staking", "nominate", [validatorAddresses])
}

export async function BondStake(senderAddress, { amount }) {
  /* istanbul ignore next */
  return await getSignMessage("staking", "bond", [
    senderAddress,
    amount,
    senderAddress
  ])
}

export async function MsgUndelegate(senderAddress, { validatorAddress }) {
  const api = await getAPI()
  // stake with all existing minus the selected
  const { targets: delegatedValidators } = await api.staking.nominators(
    senderAddress
  )
  const validatorAddresses = delegatedValidators.filter(
    delegatedValidator => delegatedValidator !== validatorAddress
  )
  return await getSignMessage("staking", "nominate", [validatorAddresses])
}

export async function UnbondStake(senderAddress, { amount }) {
  /* istanbul ignore next */
  return await getSignMessage("staking", "unbond", [amount])
}

// export function MsgRedelegate(
//   senderAddress,
//   { validatorSourceAddress, validatorDestinationAddress, amount, denom }
// ) {
//   /* istanbul ignore next */
//   return {
//     type: `cosmos-sdk/MsgBeginRedelegate`,
//     value: {
//       delegator_address: senderAddress,
//       validator_src_address: validatorSourceAddress,
//       validator_dst_address: validatorDestinationAddress,
//       amount: Coin({ amount, denom })
//     }
//   }
// }

// // Governance
// export function MsgSubmitProposal(
//   senderAddress,
//   {
//     title,
//     description,
//     initialDeposits // [{ denom, amount }]
//   }
// ) {
//   /* istanbul ignore next */
//   return {
//     type: `cosmos-sdk/MsgSubmitProposal`,
//     value: {
//       content: {
//         type: "cosmos-sdk/TextProposal",
//         value: {
//           title,
//           description
//         }
//       },
//       proposer: senderAddress,
//       initial_deposit: initialDeposits.map(Coin)
//     }
//   }
// }

// export function MsgVote(senderAddress, { proposalId, option }) {
//   /* istanbul ignore next */
//   return {
//     type: `cosmos-sdk/MsgVote`,
//     value: {
//       voter: senderAddress,
//       proposal_id: proposalId,
//       option
//     }
//   }
// }

// export function MsgDeposit(
//   senderAddress,
//   {
//     proposalId,
//     amounts // [{ denom, amount }]
//   }
// ) {
//   /* istanbul ignore next */
//   return {
//     type: `cosmos-sdk/MsgDeposit`,
//     value: {
//       depositor: senderAddress,
//       proposal_id: proposalId,
//       amount: amounts.map(Coin)
//     }
//   }
// }

// export function MsgWithdrawDelegationReward(
//   senderAddress,
//   { validatorAddress }
// ) {
//   /* istanbul ignore next */
//   return {
//     type: `cosmos-sdk/MsgWithdrawDelegationReward`,
//     value: {
//       delegator_address: senderAddress,
//       validator_address: validatorAddress
//     }
//   }
// }

// function Coin({ amount, denom }) {
//   return {
//     amount: String(amount),
//     denom
//   }
// }
