const day = 86400000
export const proposals = {
  1: {
    proposal_id: `1`,
    proposal_type: `Text`,
    title: `Proposal Title`,
    description: `Proposal description`,
    initial_deposit: [
      {
        denom: `STAKE`,
        amount: `100`
      }
    ],
    total_deposit: [
      {
        denom: `STAKE`,
        amount: `100`
      }
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `Passed`,
    final_tally_result: {
      yes: `500`,
      no: `25`,
      no_with_veto: `10`,
      abstain: `56`
    }
  },
  2: {
    proposal_id: `2`,
    proposal_type: `Text`,
    title: `VotingPeriod proposal`,
    description: `custom text proposal description`,
    initial_deposit: [
      {
        denom: `STAKE`,
        amount: `200`
      }
    ],
    total_deposit: [
      {
        denom: `STAKE`,
        amount: `200`
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
    proposal_id: `5`,
    proposal_type: `Text`,
    title: `Custom text proposal`,
    description: `custom text proposal description`,
    initial_deposit: [
      {
        denom: `STAKE`,
        amount: `20`
      }
    ],
    total_deposit: [
      {
        denom: `STAKE`,
        amount: `170`
      }
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: `0001-01-01T00:00:00Z`,
    voting_end_time: `0001-01-01T00:00:00Z`,
    proposal_status: `DepositPeriod`,
    final_tally_result: {
      yes: `0`,
      no: `0`,
      no_with_veto: `0`,
      abstain: `0`
    }
  },
  6: {
    proposal_id: `6`,
    proposal_type: `Text`,
    title: `Rejected proposal`,
    description: `this proposal was rejected`,
    initial_deposit: [
      {
        denom: `STAKE`,
        amount: `100`
      }
    ],
    total_deposit: [
      {
        denom: `STAKE`,
        amount: `100`
      }
    ],
    submit_time: new Date(Date.now()).toISOString(),
    deposit_end_time: new Date(Date.now() + day * 2).toISOString(),
    voting_start_time: new Date(Date.now() + day * 2).toISOString(),
    voting_end_time: new Date(Date.now() + day * 4).toISOString(),
    proposal_status: `Rejected`,
    final_tally_result: {
      yes: `10`,
      no: `30`,
      no_with_veto: `100`,
      abstain: `20`
    }
  }
}
