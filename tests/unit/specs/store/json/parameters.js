export const stakingParameters = {
  parameters: {
    unbonding_time: `259200000000000`,
    max_validators: 100,
    bond_denom: `STAKE`
  }
}

export const governanceParameters = {
  parameters: {
    deposit: {
      min_deposit: [
        {
          denom: `STAKE`,
          amount: `10.0000000000`
        }
      ],
      max_deposit_period: `86400000000000`
    },
    tallying: {
      threshold: `0.5000000000`,
      veto: `0.3340000000`,
      quorum: `0.3340000000`
    },
    voting: {
      voting_period: `86400000000000`
    }
  }
}
