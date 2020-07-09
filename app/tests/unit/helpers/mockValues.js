/* istanbul ignore file */

"use strict"

const day = 86400000

const botAddress = `cosmos1p6zajjw6xged056andyhn62lm7axwzyspkzjq0`
const addresses = [
  `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
  `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`,
  botAddress,
]
const validators = [
  `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
  `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
  `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
]
const state = {
  keys: [
    {
      name: `default`,
      password: `1234567890`,
      address: addresses[0],
    },
  ],
  accounts: {
    [addresses[0]]: {
      coins: [
        {
          denom: `mycoin`,
          amount: `10000000000`,
        },
        {
          denom: `fermion`,
          amount: `23000000000`,
        },
        {
          denom: `STAKE`,
          amount: `10000000000`,
        },
      ],
      sequence: `1`,
      account_number: `1`,
    },
  },
  nonces: { [addresses[0]]: 0 },
  txs: [
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgSend`,
              value: {
                from_address: addresses[1],
                to_address: addresses[0],
                amount: [{ denom: `jbcoins`, amount: `12340000000` }],
              },
            },
          ],
        },
      },
      hash: `999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A`,
      height: 1,
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgSend`,
              value: {
                from_address: addresses[0],
                to_address: addresses[1],
                amount: [{ denom: `fabocoins`, amount: `12340000000` }],
              },
            },
          ],
        },
      },
      hash: `A7C6DE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 150,
    },
    {
      hash: `QSDFGE5CA923AF08E6088F1348047F16BAHH8K31`,
      height: 56673,
      tx: {
        type: `8EFE47F0625DE8`,
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgSubmitProposal`,
              value: {
                proposer: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                proposal_type: `Text`,
                title: `Test Proposal`,
                description: `This is a test proposal`,
                initial_deposit: [
                  {
                    denom: `STAKE`,
                    amount: `1000000000`,
                  },
                ],
              },
            },
          ],
        },
      },
    },
    {
      hash: `QASDE5CA923AF08EEE38F1348047F16BAHH8K31`,
      height: 213,
      tx: {
        type: `8EFE47F0625DE8`,
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgDeposit`,
              value: {
                depositor: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
                proposal_id: `1`,
                amount: [
                  {
                    denom: `STAKE`,
                    amount: `1000000000`,
                  },
                ],
              },
            },
          ],
        },
      },
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgDelegate`,
              value: {
                validator_address: validators[0],
                delegator_address: addresses[0],
                delegation: {
                  amount: `240000000`,
                  denom: `STAKE`,
                },
              },
            },
          ],
        },
      },
      hash: `A7C6DE5CB923AF08E6088F1348047F16BABB9F48`,
      height: 160,
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgUndelegate`,
              value: {
                validator_address: validators[0],
                delegator_address: addresses[0],
                shares: `500000000`,
              },
            },
          ],
        },
      },
      hash: `A7C6FDE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 170,
    },
  ],
  stake: {
    [addresses[0]]: {
      delegations: [
        {
          delegator_address: addresses[0],
          validator_address: validators[0],
          shares: `14`,
          height: 123,
        },
      ],
      unbonding_delegations: [],
      redelegations: [],
    },
  },
  candidates: [
    {
      operator_address: validators[0],
      pub_key: `cosmosvalpub1234`,
      revoked: false,
      tokens: `140000000`,
      delegator_shares: `140000000`,
      description: {
        website: `www.monty.ca`,
        details: `Mr Mounty`,
        moniker: `mr_mounty`,
        country: `Canada`,
      },
      status: 2,
      jailed: false,
      tombstoned: false,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: `1970-01-01T00:00:00Z`,
      },
      prev_bonded_shares: `0`,
    },
    {
      operator_address: validators[1],
      pub_key: `cosmosvalpub5678`,
      revoked: false,
      tokens: `0`,
      delegator_shares: `0`,
      description: {
        website: `www.greg.com`,
        details: `Good Guy Greg`,
        moniker: `good_greg`,
        country: `USA`,
      },
      status: 2,
      jailed: false,
      tombstoned: false,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: new Date(Date.now()).toISOString(),
      },
      prev_bonded_shares: `0`,
    },
    {
      operator_address: validators[2],
      pub_key: `cosmosvalpub8910`,
      tokens: `190000000`,
      delegator_shares: `190000000`,
      description: {
        details: `Herr Schmidt`,
        website: `www.schmidt.de`,
        moniker: `herr_schmidt_revoked`,
        country: `DE`,
      },
      revoked: true,
      status: 2,
      jailed: false,
      tombstoned: false,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: new Date(Date.now()).toISOString(),
      },
      prev_bonded_shares: `0`,
    },
    {
      operator_address: validators[3],
      pub_key: `cosmosvalpub9999`,
      tokens: `190000000`,
      delegator_shares: `190000000`,
      description: {
        details: `Jailed validator`,
        website: `www.awesomewebsite.io`,
        moniker: `sad_to_be_jailed`,
        country: `ES`,
      },
      status: 0,
      jailed: true,
      tombstoned: false,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: new Date(Date.now()).toISOString(),
      },
      prev_bonded_shares: `0`,
    },
    {
      operator_address: validators[4],
      pub_key: `cosmosvalpub9999`,
      tokens: `190000000`,
      delegator_shares: `190000000`,
      description: {
        details: `Tombstoned validator`,
        website: `www.anotherawesomewebsite.io`,
        moniker: `sad_to_be_tombstoned`,
        country: `ES`,
      },
      status: 0,
      jailed: false,
      tombstoned: true,
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      proposer_reward_pool: null,
      commission: {
        rate: `0`,
        max_rate: `0`,
        max_change_rate: `0`,
        update_time: new Date(Date.now()).toISOString(),
      },
      prev_bonded_shares: `0`,
    },
  ],
  pool: {
    loose_tokens: `1000000000.00000000000`,
    bonded_tokens: `500000000.00000000000`,
  },
  stakingParameters: {
    parameters: {
      unbonding_time: `2592000000000000`,
      max_validators: 100,
      bond_denom: `STAKE`,
    },
  },
  governanceParameters: {
    deposit: {
      min_deposit: [
        {
          denom: `STAKE`,
          amount: `100000000.00000000000`,
        },
      ],
      max_deposit_period: `86400000000000`,
    },
    tallying: {
      threshold: `0.50000000000`,
      veto: `0.33400000000`,
      quorum: `0.33400000000`,
    },
    voting: {
      voting_period: `86400000000000`,
    },
  },
  sendHeight: 2,
  signing_info: {
    start_height: 2,
    index_offset: 1,
    jailed_until: new Date(Date.now()).toISOString(),
    missed_blocks_counter: 1,
  },
  proposals: {
    1: {
      proposal_id: `1`,
      proposal_type: `Text`,
      title: `Proposal Title`,
      description: `Proposal description`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `1000000000`,
        },
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `1000000000`,
        },
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
        abstain: `560000000`,
      },
    },
    2: {
      proposal_id: `2`,
      proposal_type: `Text`,
      title: `VotingPeriod proposal`,
      description: `custom text proposal description`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `2000000000`,
        },
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `2000000000`,
        },
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
        abstain: `0`,
      },
    },
    5: {
      proposal_id: `5`,
      proposal_type: `Text`,
      title: `Custom text proposal`,
      description: `custom text proposal description`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `200000000`,
        },
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `1700000000`,
        },
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
        abstain: `0`,
      },
    },
    6: {
      proposal_id: `6`,
      proposal_type: `Text`,
      title: `Rejected proposal`,
      description: `this proposal was rejected`,
      initial_deposit: [
        {
          denom: `STAKE`,
          amount: `1000000000`,
        },
      ],
      total_deposit: [
        {
          denom: `STAKE`,
          amount: `1000000000`,
        },
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
        abstain: `200000000`,
      },
    },
  },
  tallies: {
    1: {
      yes: `5000000000`,
      no: `250000000`,
      no_with_veto: `100000000`,
      abstain: `560000000`,
    },
    2: {
      yes: `0`,
      no: `0`,
      no_with_veto: `0`,
      abstain: `0`,
    },
    5: {
      yes: `0`,
      no: `0`,
      no_with_veto: `0`,
      abstain: `0`,
    },
    6: {
      yes: `100000000`,
      no: `300000000`,
      no_with_veto: `1000000000`,
      abstain: `200000000`,
    },
  },
  votes: {
    1: [
      {
        proposal_id: `1`,
        voter: validators[0],
        option: `Yes`,
      },
      {
        proposal_id: `1`,
        voter: validators[1],
        option: `NoWithVeto`,
      },
    ],
    2: [],
    5: [
      {
        proposal_id: `5`,
        voter: validators[0],
        option: `No`,
      },
      {
        proposal_id: `5`,
        voter: validators[1],
        option: `Abstain`,
      },
    ],
    6: [
      {
        proposal_id: `6`,
        voter: validators[0],
        option: `No`,
      },
      {
        proposal_id: `6`,
        voter: validators[1],
        option: `NoWithVeto`,
      },
    ],
  },
  deposits: {
    1: [
      {
        proposal_id: `1`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `150000000`,
          },
          {
            denom: `STAKE`,
            amount: `50000000`,
          },
        ],
      },
      {
        proposal_id: `1`,
        depositor: validators[1],
        amount: [
          {
            denom: `STAKE`,
            amount: `50000000`,
          },
        ],
      },
    ],
    2: [
      {
        proposal_id: `2`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `2000000000`,
          },
        ],
      },
    ],
    5: [
      {
        proposal_id: `5`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `200000000`,
          },
        ],
      },
      {
        proposal_id: `5`,
        depositor: validators[1],
        amount: [
          {
            denom: `STAKE`,
            amount: `1500000000`,
          },
        ],
      },
    ],
    6: [
      {
        proposal_id: `6`,
        depositor: validators[0],
        amount: [
          {
            denom: `STAKE`,
            amount: `1000000000`,
          },
        ],
      },
    ],
  },
}

module.exports = {
  ...state,
  state, // for backwards compatibility
  addresses,
  validators,
}
