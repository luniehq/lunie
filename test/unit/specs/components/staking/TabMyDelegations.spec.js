import {shallowMount} from "@vue/test-utils"
import TabMyDelegations from "renderer/components/staking/TabMyDelegations"

const delegator_addr = `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
const validators = [
  {
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    pub_key: `cosmosvalpub1234`,
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
    commission: {
      rate: `0`,
      max_rate: `0`,
      max_change_rate: `0`,
      update_time: `1970-01-01T00:00:00Z`
    },
    prev_bonded_shares: `0`
  },
  {
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    pub_key: `cosmosvalpub5678`,
    revoked: false,
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
    commission: {
      rate: `0`,
      max_rate: `0`,
      max_change_rate: `0`,
      update_time: new Date(Date.now()).toISOString()
    },
    prev_bonded_shares: `0`
  },
  {
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`,
    pub_key: `cosmosvalpub8910`,
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
    commission: {
      rate: `0`,
      max_rate: `0`,
      max_change_rate: `0`,
      update_time: new Date(Date.now()).toISOString()
    },
    prev_bonded_shares: `0`
  }
]

const getters = { 
  allTransactions: [],
  delegates: {
    delegates: validators
  },
  delegation: {
    unbondingDelegations: {
    },
    loaded: true
  },
  committedDelegations: {
  },
  connected: true,
  bondDenom: `stake`
}

// TODO: remove this dirty addition: the real cleanup will be done in a separate PR
// the problem is mock VS real implementation have different keys: shares in mock, shares_amount in SDK
// const unbondingTransactions = lcdClientMock.state.txs.slice(5).map(t => {
//   t.tx.value.msg[0].value.shares_amount = t.tx.value.msg[0].value.shares
//   return t
// })

describe(`Component: TabMyDelegations`, () => {
  describe(`view`, () => {
    let wrapper, $store
  
    beforeEach(() => {
      $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
      }
  
      wrapper = shallowMount(TabMyDelegations, {
        mocks: {
          $store
        },
        stubs: [`router-link`]
      })
    })

    it(`should show committed validators`, () => {
      $store.getters.committedDelegations = {
        [validators[0].operator_address]: 42
      }

      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  
    it(`should show unbonding validators and the current committed validator`, () => {
      wrapper.setData({
        time: {
          // get unbonding time for an unbonding tx
          getUnbondingTime: jest.fn(() => Date.now() + 10000)
        }
      })
      $store.getters.delegation.unbondingDelegations = {
        [validators[1].operator_address]: {
          creation_height: `170`,
          min_time: new Date(Date.now()).toISOString()
        }
      }
      $store.getters.allTransactions = [{
        tx: {
          value: {
            msg: [
              {
                type: `cosmos-sdk/BeginUnbonding`,
                value: {
                  validator_addr: validators[0].operator_address,
                  delegator_addr,
                  shares: `5`
                }
              }
            ]
          }
        },
        hash: `A7C6FDE5CA923AF08E6088F1348047F16BABB9F48`,
        height: 170
      }]
      
      expect(wrapper.html()).toContain(`Pending Undelegations`)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  
    it(`should show a message if not staked yet to any validator`, () => {
      $store.getters.committedDelegations = {}
  
      expect(wrapper.html()).toContain(`No Active Delegations`)
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  
    it(`should show a message if not still connecting to a node`, () => {
      $store.getters.connected = false
  
      expect(wrapper.exists(`tm-data-connecting`)).toBe(true)
    })
  
    it(`should show a message if not still loading delegations`, () => {
      $store.getters.delegation.loading = true
  
      expect(wrapper.exists(`tm-data-loading`)).toBe(true)
    })
  })

  describe(`computed`, () => {
    it(`unbondingTransactions`, async () => {
      const address = validators[0].operator_address
      const transactions = [{
        tx: {
          value: {
            msg: [
              {
                type: `cosmos-sdk/XXX`,
              }
            ]
          }
        }
      }, {
        tx: {
          value: {
            msg: [
              {
                type: `cosmos-sdk/BeginUnbonding`,
                value: {
                  validator_addr: validators[0].operator_address,
                  delegator_addr,
                  shares: `5`
                }
              }
            ]
          }
        },
        hash: `A7C6FDE5CA923AF08E6088F1348047F16BABB9F48`,
        height: 170
      }]
  
      expect(
        TabMyDelegations.computed.unbondingTransactions({
          delegation: {
            unbondingDelegations: {
              [address]: {
                creation_height: `170`,
                min_time: new Date().toISOString()
              }
            }
          },
          allTransactions: transactions
        })
      ).toHaveLength(1)
    })
  
    it(`yourValidators`, () => {
      expect(
        TabMyDelegations.computed.yourValidators({
          committedDelegations: {
            [validators[0].operator_address]: 1,
            [validators[2].operator_address]: 2
          },
          delegates: { delegates: validators }
        })
      ).toEqual([validators[0], validators[2]])
    })
  })

})
