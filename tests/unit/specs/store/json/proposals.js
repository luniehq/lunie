import { validators } from "./addresses"
const day = 86400000
export const proposals = {
  1: {
    id: `1`,
    proposal_type: `Text`,
    content: {
      value: {
        title: `Proposal Title`,
        description: `Proposal description`
      }
    },
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
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `Passed`,
    final_tally_result: {
      yes: `5000000000`,
      no: `250000000`,
      no_with_veto: `100000000`,
      abstain: `560000000`
    }
  },
  2: {
    id: `2`,
    proposal_type: `Text`,
    content: {
      value: {
        title: `VotingPeriod proposal`,
        description: `custom text proposal description`
      }
    },
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
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `VotingPeriod`,
    final_tally_result: {
      yes: `0`,
      no: `0`,
      no_with_veto: `0`,
      abstain: `0`
    }
  },
  5: {
    id: `5`,
    proposal_type: `Text`,
    content: {
      value: {
        title: `Custom text proposal`,
        description: `custom text proposal description`
      }
    },
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
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: `0001-01-01T00:00:00Z`, // TODO: fix
    voting_end_time: `0001-01-01T00:00:00Z`, // TODO: fix
    proposal_status: `DepositPeriod`,
    final_tally_result: {
      yes: `0`,
      no: `0`,
      no_with_veto: `0`,
      abstain: `0`
    }
  },
  6: {
    id: `6`,
    proposal_type: `Text`,
    content: {
      value: {
        title: `Rejected proposal`,
        description: `this proposal was rejected`
      }
    },
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
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `Rejected`,
    final_tally_result: {
      yes: `100000000`,
      no: `300000000`,
      no_with_veto: `1000000000`,
      abstain: `200000000`
    }
  }
}
export const votes = {
  1: [
    {
      id: `1`,
      voter: validators[0],
      option: `Yes`
    },
    {
      id: `1`,
      voter: validators[1],
      option: `NoWithVeto`
    }
  ],
  2: [],
  5: [
    {
      id: `5`,
      voter: validators[0],
      option: `No`
    },
    {
      id: `5`,
      voter: validators[1],
      option: `Abstain`
    }
  ],
  6: [
    {
      id: `6`,
      voter: validators[0],
      option: `No`
    },
    {
      id: `6`,
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
