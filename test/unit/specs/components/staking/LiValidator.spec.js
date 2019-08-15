import { shallowMount, createLocalVue } from "@vue/test-utils"
import LiValidator from "src/components/staking/LiValidator"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`LiValidator`, () => {
  let wrapper, $store

  const validator = {
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
    pub_key: `cosmosvalpub1234`,
    jailed: false,
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
    commission: `0.05`,
    prev_bonded_shares: `0`,
    signing_info: {
      start_height: 0,
      index_offset: 465400,
      jailed_until: `1970-01-01T00:00:00Z`,
      missed_blocks_counter: 122
    },
    uptime: 0.98778883,
    expectedReturns: 0.13
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        delegates: { delegates: [] },
        committedDelegations: {},
        distribution: {
          rewards: {}
        },
        session: {
          signedIn: true
        },
        bondDenom: `stake`,
        lastHeader: ``,
        pool: {
          pool: {
            bonded_tokens: 1000
          }
        }
      }
    }

    wrapper = shallowMount(LiValidator, {
      localVue,
      propsData: {
        validator,
        disabled: false
      },
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the voting power`, () => {
    expect(wrapper.html()).toContain(`1.40%`)
  })

  it(`works if user is not signed in`, () => {
    $store.getters.session.signedIn = false

    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
