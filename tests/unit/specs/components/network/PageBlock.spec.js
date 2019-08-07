import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageBlock from "src/components/network/PageBlock"
import { bankTxs } from "../../store/json/txs"

const validators = {
  cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw: {
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
  cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au: {
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
  cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctgurrg7n: {
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
}

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`PageBlock`, () => {
  let wrapper

  const getters = {
    connected: true,
    lastHeader: {
      height: `1000`
    },
    block: {
      block: {
        header: {
          height: `100`,
          num_txs: bankTxs.length,
          proposer_address: `ABCDEFG123456HIJKLMNOP`,
          time: Date.now()
        }
      },

      block_meta: {
        block_id: {
          hash: `ABCD1234`
        }
      },
      transactions: bankTxs
    },
    validators
  }

  beforeEach(() => {
    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks: {
        $store: {
          getters,
          dispatch: jest.fn(),
          state: {
            delegation: {},
            session: { address: `` }
          }
        },
        $route: {
          params: { height: `100` }
        },
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    // getBlockSpy = jest.spyOn(wrapper.vm, "getBlock")
  })

  it(`shows a page with information about a certain block`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows the block page with no txs`, () => {
    const mocks = {
      $store: {
        getters,
        state: {
          delegation: {},
          session: { address: `` }
        },
        dispatch: jest.fn()
      },
      $route: {
        params: { height: `100` }
      },
      $router: {
        push: jest.fn()
      }
    }
    mocks.$store.getters.block.transactions = []
    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks,
      stubs: [`router-link`]
    })

    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.text()).toMatch(/No Transactions/)
  })

  it(`loads the block information when the route changes`, () => {
    const getBlockSpy = jest.spyOn(wrapper.vm, "getBlock")
    wrapper.vm.$route.params.height = 101
    expect(getBlockSpy).toHaveBeenCalledTimes(1)
  })

  it(`shows the page when the block hasn't been loaded yet`, () => {
    wrapper = shallowMount(PageBlock, {
      localVue,
      mocks: {
        $store: {
          getters: Object.assign({}, getters, {
            block: {}
          }),
          state: {
            delegation: {},
            session: { address: `` }
          },
          dispatch: jest.fn()
        },
        $route: {
          params: { height: `100` }
        },
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })

    expect(wrapper.element).not.toBeUndefined()
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`redirects to the 404 page if the block doesn't exist`, async () => {
    const routerPush = jest.fn()

    await PageBlock.methods.getBlock({
      $store: {
        dispatch: jest.fn(() => null) // not returning a block when querying
      },
      $route: {
        params: {
          height: `42`
        }
      },
      $router: {
        push: routerPush
      },
      lastHeader: {
        height: `1`
      }
    })

    expect(routerPush).toHaveBeenCalledWith(`/404`)

    routerPush.mockClear()
    await PageBlock.methods.getBlock({
      $store: {
        dispatch: () => ({ x: 1 }) // return pseudo block
      },
      $route: {
        params: {
          height: 42
        }
      },
      $router: {
        push: routerPush
      },
      lastHeader: {
        height: `1000`
      }
    })

    expect(routerPush).not.toHaveBeenCalledWith(`/404`)
  })
})
