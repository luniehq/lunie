// Bank
export function MsgSend(
  senderAddress,
  {
    toAddress,
    amounts // [{ denom, amount}]
  }
) {
  return {
    type: `cosmos-sdk/MsgSend`,
    value: {
      from_address: senderAddress,
      to_address: toAddress,
      amount: amounts.map(Coin)
    }
  }
}

// Staking
export function MsgDelegate(
  senderAddress,
  {
    validator_address,
    amount,
    denom
  }
) {
  return {
    type: `cosmos-sdk/MsgDelegate`,
    value: {
      validator_address,
      value: Coin({ amount, denom })
    }
  }
}

export function MsgUndelegate(
  senderAddress,
  {
    validator_address,
    shares_amount
  }
) {
  return {
    type: `cosmos-sdk/MsgUndelegate`,
    value: {
      validator_address,
      shares_amount,
      delegator_address: senderAddress
    }
  }
}

export function MsgRedelegate(
  senderAddress,
  {
    validator_src_address,
    validator_dst_address,
    shares_amount
  }
) {
  return {
    type: `cosmos-sdk/MsgBeginRedelegate`,
    value: {
      validator_src_address,
      validator_dst_address,
      shares_amount
    }
  }
}

// Governance

export function MsgSubmitProposal(
  senderAddress,
  {
    proposalType,
    title,
    description,
    initialDeposits // [{ denom, amount }]
  }
) {
  return {
    type: `cosmos-sdk/MsgSubmitProposal`,
    value: {
      proposer: senderAddress,
      proposal_type: proposalType,
      title,
      description,
      initial_deposit: initialDeposits.map(Coin)
    }
  }
}

export function MsgVote(
  senderAddress,
  {
    proposalId,
    option
  }
) {
  return {
    type: `cosmos-sdk/MsgVote`,
    value: {
      voter: senderAddress,
      proposal_id: proposalId,
      option
    }
  }
}

export function MsgDeposit(
  senderAddress,
  {
    proposalId,
    amounts // [{ denom, amount }]
  }
) {
  return {
    type: `cosmos-sdk/MsgDeposit`,
    value: {
      depositer: senderAddress,
      proposal_id: proposalId,
      amount: amounts.map(Coin)
    }
  }
}

export function MsgWithdrawDelegationReward(
  senderAddress,
  {
    validatorAddresses
  }
) {
  return validatorAddresses.map(validatorAddress => ({
    type: `cosmos-sdk/MsgWithdrawDelegationReward`,
    value: {
      delegator_address: senderAddress,
      validator_address: validatorAddress
    }
  }))
}

function Coin({ amount, denom }) {
  return ({
    amount: String(amount),
    denom
  })
}