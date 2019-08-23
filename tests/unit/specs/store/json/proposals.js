import { validators } from "./addresses"
const day = 86400000
export const proposals = {
  1: {
    proposal_id: `1`,
    type: `Text`,
    title: `Proposal Title`,
    description: `Proposal description`,
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `Passed`,
    final_yes: `5000000000`,
    final_no: `250000000`,
    final_no_with_veto: `100000000`,
    final_abstain: `560000000`,
    initial_deposit: [
      {
        denom: `stake`,
        amount: `1000000000`
      }
    ],
    total_deposit: [
      {
        denom: `stake`,
        amount: `1000000000`
      }
    ]
  },
  2: {
    proposal_id: `2`,
    type: `Text`,
    title: `VotingPeriod proposal`,
    description: `custom text proposal description`,
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `VotingPeriod`,
    final_yes: `0`,
    final_no: `0`,
    final_no_with_veto: `0`,
    final_abstain: `0`,
    initial_deposit: [
      {
        denom: `stake`,
        amount: `2000000000`
      }
    ],
    total_deposit: [
      {
        denom: `stake`,
        amount: `2000000000`
      }
    ]
  },
  5: {
    proposal_id: `5`,
    type: `Text`,
    title: `Custom text proposal`,
    description: `custom text proposal description`,
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: `0001-01-01T00:00:00Z`, // TODO: fix
    voting_end_time: `0001-01-01T00:00:00Z`, // TODO: fix
    proposal_status: `DepositPeriod`,
    final_yes: `0`,
    final_no: `0`,
    final_no_with_veto: `0`,
    final_abstain: `0`,
    initial_deposit: [
      {
        denom: `stake`,
        amount: `200000000`
      }
    ],
    total_deposit: [
      {
        denom: `stake`,
        amount: `1700000000`
      }
    ]
  },
  6: {
    proposal_id: `6`,
    type: `Text`,
    title: `Rejected proposal`,
    description:
      "In fugiat nostrud enim cupidatat officia mollit. In fugiat nostrud enim cupidatat officia mollit. In fugiat nostrud enim cupidatat officia mollit. In fugiat nostrud enim cupidatat officia mollit.Consequat velit exercitation mollit amet cillum tempor cupidatat.",
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `Rejected`,
    final_yes: `100000000`,
    final_no: `300000000`,
    final_no_with_veto: `1000000000`,
    final_abstain: `200000000`,
    initial_deposit: [
      {
        denom: `stake`,
        amount: `1000000000`
      }
    ],
    total_deposit: [
      {
        denom: `stake`,
        amount: `1000000000`
      }
    ]
  }
}

export const votes = {
  1: [
    {
      proposal_id: `1`,
      voter: validators[0],
      option: `Yes`
    },
    {
      proposal_id: `1`,
      voter: validators[1],
      option: `NoWithVeto`
    }
  ],
  2: [],
  5: [
    {
      proposal_id: `5`,
      voter: validators[0],
      option: `No`
    },
    {
      proposal_id: `5`,
      voter: validators[1],
      option: `Abstain`
    }
  ],
  6: [
    {
      proposal_id: `6`,
      voter: validators[0],
      option: `No`
    },
    {
      proposal_id: `6`,
      voter: validators[1],
      option: `NoWithVeto`
    }
  ]
}
export const tallies = {
  1: {
    yes: `5000000000`,
    no: `250000000`,
    no_with_veto: `100000000`,
    abstain: `560000000`
  },
  2: {
    yes: `0`,
    no: `0`,
    no_with_veto: `0`,
    abstain: `0`
  },
  5: {
    yes: `0`,
    no: `0`,
    no_with_veto: `0`,
    abstain: `0`
  },
  6: {
    yes: `100000000`,
    no: `300000000`,
    no_with_veto: `1000000000`,
    abstain: `200000000`
  }
}
