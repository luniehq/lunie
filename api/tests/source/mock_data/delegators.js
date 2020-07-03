const delegatorAddress = 'cosmos1fh44aqn7m4v570ujtjlmt3dytq80qyfwj07ckc'

const mockValidatorsDictionary = {
  [delegatorAddress]: {
    networkId: 'cosmos-hub-testnet',
    operatorAddress: delegatorAddress,
    consensusPubkey:
      'cosmosvalconspub1zcjduepqndtvyf7ggaamy2qzafjm9fnn3us4fllv89wtl40nt586q5g90rnsaxtvlz',
    jailed: false,
    details: '',
    website: 'https://fissionlabs.io',
    identity: '',
    name: 'Fission Labs',
    votingPower: '0.084015352',
    startHeight: '0',
    uptimePercentage: 1,
    tokens: '60002.000010',
    commissionUpdateTime: '2019-12-20T17:00:00Z',
    commission: '0.500000000000000000',
    maxCommission: '1.000000000000000000',
    maxChangeCommission: '1.000000000000000000',
    status: 'ACTIVE',
    statusDetailed: 'active',
    delegatorShares: '60002000010.000000000000000000'
  }
}

const delegatorRewards = {
  result: {
    rewards: [
      {
        validator_address: delegatorAddress,
        reward: [
          {
            denom: 'umuon',
            amount: '107080042987452090'
          }
        ]
      }
    ],
    total: [
      {
        denom: 'umuon',
        amount: '107080042987452090'
      }
    ]
  }
}

module.exports = {
  delegatorAddress,
  mockValidatorsDictionary,
  delegatorRewards
}
