// Bank

import BigNumber from "bignumber.js"

/* istanbul ignore next */
export function SendTx(senderAddress, { to, amount, amounts }, network) {
  return {
    type: `cosmos-sdk/MsgSend`,
    value: {
      from_address: senderAddress,
      to_address: to[0],
      amount: amount
        ? [Coin(amount, network.coinLookup)]
        : amounts.map((amount) => Coin(amount, network.coinLookup)),
    },
  }
}

// Staking
export function StakeTx(senderAddress, { to, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgDelegate`,
    value: {
      delegator_address: senderAddress,
      validator_address: to[0],
      amount: Coin(amount, network.coinLookup),
    },
  }
}

export function UnstakeTx(senderAddress, { from, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgUndelegate`,
    value: {
      validator_address: from[0],
      delegator_address: senderAddress,
      amount: Coin(amount, network.coinLookup),
    },
  }
}

export function RestakeTx(senderAddress, { from, to, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgBeginRedelegate`,
    value: {
      delegator_address: senderAddress,
      validator_src_address: from[0],
      validator_dst_address: to[0],
      amount: Coin(amount, network.coinLookup),
    },
  }
}

// Governance
export function SubmitProposalTx(
  senderAddress,
  {
    // proposalType,
    proposalTitle,
    proposalDescription,
    initialDeposit,
  },
  network
) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgSubmitProposal`,
    value: {
      content: {
        type: "cosmos-sdk/TextProposal",
        value: {
          title: proposalTitle,
          description: proposalDescription,
        },
      },
      proposer: senderAddress,
      initial_deposit: [Coin(initialDeposit, network.coinLookup)],
    },
  }
}

export function VoteTx(senderAddress, { proposalId, voteOption }) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgVote`,
    value: {
      voter: senderAddress,
      proposal_id: proposalId,
      option: voteOption, // TEST
    },
  }
}

export function DepositTx(senderAddress, { proposalId, amount }, network) {
  /* istanbul ignore next */
  return {
    type: `cosmos-sdk/MsgDeposit`,
    value: {
      depositor: senderAddress,
      proposal_id: proposalId,
      amount: [Coin(amount, network.coinLookup)],
    },
  }
}

export function ClaimRewardsTx(
  senderAddress,
  {
    // amounts,
    from,
  }
) {
  /* istanbul ignore next */
  return from.map((validatorAddress) => ({
    type: `cosmos-sdk/MsgWithdrawDelegationReward`,
    value: {
      delegator_address: senderAddress,
      validator_address: validatorAddress,
    },
  }))
}

export function Coin({ amount, denom }, coinLookup) {
  const lookup = coinLookup.find(({ viewDenom }) => viewDenom === denom)
  return {
    amount: BigNumber(amount)
      .dividedBy(lookup.chainToViewConversionFactor)
      .toFixed(),
    denom: lookup.chainDenom,
  }
}
