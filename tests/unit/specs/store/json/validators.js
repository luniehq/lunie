export default [
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    pub_key: `cosmosvalpub1234`,
    revoked: false,
    tokens: `14`,
    delegator_shares: `14`,
    description: {
      website: `www.monty.ca`,
      details: `Mr Mounty`,
      moniker: `mr_mounty`,
      country: `Canada`,
      identity: `keybase`
    },
    signing_info: {
      missed_blocks_counter: 2
    },
    status: 2,
    bond_height: `0`,
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: {
      commission_rates: {
        rate: 0,
        max_rate: `0`,
        max_change_rate: `0`
      },
      update_time: `1970-01-01T00:00:00Z`
    },
    prev_bonded_shares: `0`
  },
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    pub_key: `cosmosvalpub5678`,
    revoked: false,
    tokens: `0`,
    delegator_shares: `0`,
    description: {
      website: `www.greg.com`,
      details: `Good Guy Greg`,
      moniker: `good_greg`,
      country: `USA`,
      identity: `keybase`
    },
    signing_info: null,
    status: 2,
    bond_height: `0`,
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: {
      commission_rates: {
        rate: 0,
        max_rate: `0`,
        max_change_rate: `0`
      },
      update_time: new Date(Date.now()).toISOString()
    },
    prev_bonded_shares: `0`
  },
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    pub_key: `cosmosvalpub8910`,
    tokens: `19`,
    delegator_shares: `19`,
    description: {
      details: `Herr Schmidt`,
      website: `www.schmidt.de`,
      moniker: `herr_schmidt_revoked`,
      country: `DE`,
      identity: `keybase`
    },
    revoked: true,
    signing_info: {
      missed_blocks_counter: 2000
    },
    status: 2,
    bond_height: `0`,
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: {
      commission_rates: {
        rate: 0,
        max_rate: `0`,
        max_change_rate: `0`
      },
      update_time: new Date(Date.now()).toISOString()
    },
    prev_bonded_shares: `0`
  }
]
