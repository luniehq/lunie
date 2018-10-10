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
    prev_bonded_shares: `0`,
    voting_power: `8`
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
    prev_bonded_shares: `0`,
    voting_power: `7`
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
    prev_bonded_shares: `0`,
    voting_power: `6`
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
      tokens: `0`,
      voting_power: `7`
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
      tokens: `0`,
      voting_power: `7`
    }
  ])
})

test(`address`, () => {
  expect(
    TabMyDelegations.computed.address({
      user: {
        address: `cosmos1asdfasdf`
      }
    })
  ).toEqual(`cosmos1asdfasdf`)
})

test(`properties`, () => {
  expect(
    TabMyDelegations.computed.properties({
      bondingDenom: `tofu-steaks`
    })
  ).toEqual([
    {
      title: `Moniker`,
      value: `small_moniker`,
      tooltip: `The validator's moniker`,
      class: `name`
    },
    {
      title: `Bonded tofu-steaks`,
      value: `your_votes`,
      tooltip: `Number of tofu-steaks you have delegated to the validator`,
      class: `your-votes`
    },
    {
      title: `Rewards`,
      value: `your_rewards`,
      tooltip: `Rewards of tofu-steaks you have gained from the validator`,
      class: `your-rewards`
    },
    {
      title: `Voting Power`,
      value: `percent_of_vote`,
      tooltip: `Percentage of tofu-steaks the validator has on The Cosmos Hub`,
      class: `percent_of_vote`
    },
    {
      title: `Uptime`,
      value: `uptime`,
      tooltip: `Ratio of blocks signed within the last 10k blocks`,
      class: `uptime`
    },
    {
      title: `Commission`,
      value: `commission`,
      tooltip: `The validator's commission`,
      class: `commission`
    },
    {
      title: `Slashes`,
      value: `slashes`,
      tooltip: `The validator's slashes`,
      class: `slashes`
    }
  ])
})

test(`sort`, () => {
  expect(TabMyDelegations.data()).toEqual({
    bondInfo: `Validators you are currently bonded to`,
    sort: { order: `desc`, property: `percent_of_vote` },
    unbondInfo: `Your bonded validators in unbonding process`
  })
})
