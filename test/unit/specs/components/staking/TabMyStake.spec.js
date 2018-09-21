import TabMyStake from "renderer/components/staking/TabMyStake"
import { mount } from "@vue/test-utils"

const delegates = [
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    pub_key: {
      type: "AC26791624DE60",
      data: "t3zVnKU42WNH+NtYFcstZRLFVULWV8VagoP0HwW43Pk="
    },
    revoked: false,
    tokens: "14",
    delegator_shares: "14",
    description: {
      website: "www.monty.ca",
      details: "Mr Mounty",
      moniker: "mr_mounty",
      country: "Canada"
    },
    status: 2,
    bond_height: "0",
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: "0",
    commission_max: "0",
    commission_change_rate: "0",
    commission_change_today: "0",
    prev_bonded_shares: "0"
  },
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    pub_key: {
      type: "AC26791624DE60",
      data: "9M4oaDArXKVU5ffqjq2TkynTCMJlyLzpzZLNjHtqM+w="
    },
    tokens: "0",
    delegator_shares: "0",
    description: {
      website: "www.greg.com",
      details: "Good Guy Greg",
      moniker: "good_greg",
      country: "USA"
    },
    status: 2,
    bond_height: "0",
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: "0",
    commission_max: "0",
    commission_change_rate: "0",
    commission_change_today: "0",
    prev_bonded_shares: "0"
  },
  {
    id: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    owner: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    pub_key: {
      type: "AC26791624DE60",
      data: "dlN5SLqeT3LT9WsUK5iuVq1eLQV2Q1JQAuyN0VwSWK0="
    },
    tokens: "19",
    delegator_shares: "19",
    description: {
      details: "Herr Schmidt",
      website: "www.schmidt.de",
      moniker: "herr_schmidt_revoked",
      country: "DE"
    },
    revoked: true,
    status: 2,
    bond_height: "0",
    bond_intra_tx_counter: 6,
    proposer_reward_pool: null,
    commission: "0",
    commission_max: "0",
    commission_change_rate: "0",
    commission_change_today: "0",
    prev_bonded_shares: "0"
  }
]

test(`yourValidators`, () => {
  const $store = {
    commit: jest.fn(),
    dispatch: jest.fn(),
    getters: {
      bondingDenom: `atom`,
      committedDelegations: {
        cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: 14
      },
      delegates: {
        delegates
      },
      delegation: {
        committedDelegates: {
          cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: 3
        },
        unbondingDelegations: {}
      },
      shoppingCart: [],
      user: {}
    }
  }

  const {
    vm: { yourValidators }
  } = mount(TabMyStake, {
    mocks: {
      $store
    }
  })

  expect(yourValidators).toEqual([
    {
      bond_height: "0",
      bond_intra_tx_counter: 6,
      commission: "0",
      commission_change_rate: "0",
      commission_change_today: "0",
      commission_max: "0",
      delegator_shares: "14",
      description: {
        country: "Canada",
        details: "Mr Mounty",
        moniker: "mr_mounty",
        website: "www.monty.ca"
      },
      id: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
      owner: "cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw",
      prev_bonded_shares: "0",
      proposer_reward_pool: null,
      pub_key: {
        data: "t3zVnKU42WNH+NtYFcstZRLFVULWV8VagoP0HwW43Pk=",
        type: "AC26791624DE60"
      },
      revoked: false,
      status: 2,
      tokens: "14"
    }
  ])
})
