import PageTransactions from "src/components/wallet/PageTransactions"
import { createLocalVue, shallowMount } from "@vue/test-utils"

describe(`PageTransactions`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  const addresses = [
    `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
    `cosmos1pxdf0lvq5jvl9uxznklgc5gxuwzpdy5ynem546`
  ]
  const validatorAddresses = [
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n`
  ]
  const allTransactions = [
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgSend`,
              value: {
                from_address: addresses[1],
                to_address: addresses[0],
                amount: [{ denom: `jbcoins`, amount: `1234` }]
              }
            }
          ]
        }
      },
      hash: `999ADECC2DE8C3AC2FD4F45E5E1081747BBE504A`,
      height: 1
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
                amount: [{ denom: `fabocoins`, amount: `1234` }]
              }
            }
          ]
        }
      },
      hash: `A7C6DE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 150
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
                    amount: `100`
                  }
                ]
              }
            }
          ]
        }
      }
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
                    amount: `100`
                  }
                ]
              }
            }
          ]
        }
      }
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/MsgDelegate`,
              value: {
                validator_address: validatorAddresses[0],
                delegator_address: addresses[0],
                delegation: {
                  amount: `24`,
                  denom: `STAKE`
                }
              }
            }
          ]
        }
      },
      hash: `A7C6DE5CB923AF08E6088F1348047F16BABB9F48`,
      height: 160
    },
    {
      tx: {
        value: {
          msg: [
            {
              type: `cosmos-sdk/BeginUnbonding`,
              value: {
                validator_address: validatorAddresses[0],
                delegator_address: addresses[0],
                shares: `5`
              }
            }
          ]
        }
      },
      hash: `A7C6FDE5CA923AF08E6088F1348047F16BABB9F48`,
      height: 170
    }
  ]
  const validators = [
    {
      operator_address: validatorAddresses[0],
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
      operator_address: validatorAddresses[1],
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
      operator_address: validatorAddresses[2],
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

  let wrapper, $store

  const getters = {
    filters: {
      transactions: {
        search: {
          query: ``,
          visible: false
        }
      }
    },
    bondDenom: `STAKE`,
    session: {
      address: addresses[0]
    },
    transactions: {
      loading: false,
      loaded: true,
      error: undefined
    },
    delegation: {
      unbondingDelegations: {} // TODO: add some
    },
    delegates: {
      delegates: validators
    },
    allTransactions,
    connected: true,
    lastHeader: ``
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: JSON.parse(JSON.stringify(getters)) // clone so we don't overwrite by accident
    }

    wrapper = shallowMount(PageTransactions, {
      localVue,
      directives: {
        infiniteScroll: () => {}
      },
      mocks: {
        $store
      }
    })
    wrapper.setData({ showing: 2 })
  })

  describe(`displays the transaction page`, () => {
    it(`if user has signed in`, async () => {
      expect(wrapper.vm.$el).toMatchSnapshot()
    })

    it(`if user hasn't signed in`, async () => {
      $store.getters.session.address = undefined
      $store = {
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters
      }

      wrapper = shallowMount(PageTransactions, {
        localVue,
        directives: {
          infiniteScroll: () => {}
        },
        mocks: {
          $store
        }
      })
      expect(wrapper.vm.$el).toMatchSnapshot()
    })
  })

  it(`should refresh the transaction history`, async () => {
    await PageTransactions.methods.refreshTransactions.call({
      $store,
      session: {
        signedIn: true
      }
    })
    expect($store.dispatch).toHaveBeenCalledWith(`getAllTxs`)

    $store.dispatch.mockClear()
    await PageTransactions.methods.refreshTransactions.call({
      $store,
      session: {
        signedIn: false
      }
    })
    expect($store.dispatch).not.toHaveBeenCalledWith(`getAllTxs`)
  })

  it(`should load transactions when signing in`, () => {
    const refreshTransactions = jest.fn()
    PageTransactions.watch[`session.signedIn`].handler.call({
      refreshTransactions
    })
    expect(refreshTransactions).toHaveBeenCalled()
  })

  it(`should show transactions`, async () => {
    expect(wrapper.findAll(`LiAnyTransaction-stub`).length).toBe(2)
  })

  it("should load more findAll (on infinite scroll)", () => {
    expect(wrapper.findAll("LiAnyTransaction-stub").length).toBe(2)
    wrapper.vm.loadMore()
    expect(wrapper.findAll("LiAnyTransaction-stub").length).toBe(6)
  })

  it(`should sort the transaction by time`, () => {
    expect(wrapper.vm.orderedTransactions.map(x => x.height)).toEqual([
      56673,
      213,
      170,
      160,
      150,
      1
    ])
  })
})
