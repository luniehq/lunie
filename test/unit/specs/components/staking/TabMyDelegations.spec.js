import TabMyDelegations from "renderer/components/staking/TabMyDelegations"

const delegates = [
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    pub_key: `valpub123456789`,
    revoked: false,
    tokens: `14`,
    delegator_shares: `14`,
    description: {
      website: `www.monty.ca`,
      details: `Mr Mounty`,
      moniker: `mr_mounty`,
      country: `Canada`
    },
    status: 2,
    bond_height: `0`,
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: `0`,
    commission_max: `0`,
    commission_change_rate: `0`,
    commission_change_today: `0`,
    prev_bonded_shares: `0`
  },
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    pub_key: `pubsub1234567891234`,
    tokens: `0`,
    delegator_shares: `0`,
    description: {
      website: `www.greg.com`,
      details: `Good Guy Greg`,
      moniker: `good_greg`,
      country: `USA`
    },
    status: 2,
    bond_height: `0`,
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: `0`,
    commission_max: `0`,
    commission_change_rate: `0`,
    commission_change_today: `0`,
    prev_bonded_shares: `0`
  },
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    pub_key: `subpump987654321`,
    tokens: `19`,
    delegator_shares: `19`,
    description: {
      details: `Herr Schmidt`,
      website: `www.schmidt.de`,
      moniker: `herr_schmidt_revoked`,
      country: `DE`
    },
    revoked: true,
    status: 2,
    bond_height: `0`,
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: `0`,
    commission_max: `0`,
    commission_change_rate: `0`,
    commission_change_today: `0`,
    prev_bonded_shares: `0`
  }
]

test(`undelegatedValidators`, () => {
  expect(
    TabMyDelegations.computed.undelegatedValidators({
      delegation: {
        unbondingDelegations: {
          cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 3
        }
      },
      delegates: { delegates }
    })
  ).toEqual([
    {
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      commission: `0`,
      commission_change_rate: `0`,
      commission_change_today: `0`,
      commission_max: `0`,
      delegator_shares: `0`,
      description: {
        country: `USA`,
        details: `Good Guy Greg`,
        moniker: `good_greg`,
        website: `www.greg.com`
      },
      id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      prev_bonded_shares: `0`,
      proposer_reward_pool: null,
      pub_key: `pubsub1234567891234`,
      status: 2,
      tokens: `0`
    }
  ])
})

test(`yourValidators`, () => {
  expect(
    TabMyDelegations.computed.yourValidators({
      committedDelegations: {
        cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 3
      },
      delegates: { delegates }
    })
  ).toEqual([
    {
      bond_height: `0`,
      bond_intra_tx_counter: 6,
      commission: `0`,
      commission_change_rate: `0`,
      commission_change_today: `0`,
      commission_max: `0`,
      delegator_shares: `0`,
      description: {
        country: `USA`,
        details: `Good Guy Greg`,
        moniker: `good_greg`,
        website: `www.greg.com`
      },
      id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
      prev_bonded_shares: `0`,
      proposer_reward_pool: null,
      pub_key: `pubsub1234567891234`,
      status: 2,
      tokens: `0`
    }
  ])
})
