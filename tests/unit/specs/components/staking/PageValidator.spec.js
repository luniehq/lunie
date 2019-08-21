import { shallowMount, createLocalVue } from "@vue/test-utils"
import PageValidator from "src/components/staking/PageValidator"

const validator = {
  operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctqzh8yqw`,
  pub_key: `cosmosvalpub1234`,
  keybaseId: "DE8EDE345676546",
  identity: "DE8E37240061B04E",
  userName: "Username",
  jailed: false,
  tokens: `14`,
  delegator_shares: `14`,
  website: `www.monty.ca`,
  details: `Mr Mounty`,
  moniker: `mr_mounty`,
  status: 2,
  bond_intra_tx_counter: 6,
  proposer_reward_pool: null,
  rate: `0.05`,
  max_rate: `0.1`,
  max_change_rate: `0.005`,
  update_time: Date.now() - 1,
  prev_bonded_shares: `0`,
  avatarUrl: "www.blah.com/img.jpg",
  profileUrl: "https://keybase.io/val",
  lastUpdated: "2019-08-13T16:03:35.054472+00:00",
  min_self_delegation: "100000000000",
  unbonding_height: 0,
  unbonding_time: "1970-01-01T00:00:00Z",
  consensus_pubkey: "cosmosvalpub1234asjdlkjashdlasjdhladjhaljds",
  customized: false
}

const validatorTo = {
  operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
  moniker: `good_greg`
}

const state = {
  session: {
    signedIn: true,
    address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`
  },
  pool: {
    pool: {
      bonded_tokens: 4200
    }
  },
  distribution: {
    rewards: {
      [validator.operator_address]: 10
    }
  },
  delegation: { loaded: true },
  delegates: {
    selfBond: {
      [validator.operator_address]: 0.01
    },
    delegates: [validator, validatorTo],
    loaded: true
  },
  minting: {
    annualProvision: "100"
  },
  annualProvision: "100"
}

const getters = {
  committedDelegations: {
    [validator.operator_address]: 0
  },
  lastHeader: {
    height: `500`
  },
  liquidAtoms: 1337,
  connected: true,
  bondDenom: `STAKE`
}

const stubbedModal = {
  open: jest.fn(),
  render: () => {}
}

describe(`PageValidator`, () => {
  let wrapper, $store, $apollo
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters,
      state
    }
    $apollo = {
      queries: {
        validator: {
          loading: false
        }
      }
    }
    wrapper = shallowMount(PageValidator, {
      localVue,
      mocks: {
        $store,
        $apollo,
        // $refs,
        $route: {
          params: { validator: validator.operator_address }
        }
      },
      stubs: {
        "router-link": true,
        "delegationmodal-stub": stubbedModal
      }
    })
    wrapper.setData({ validator })
    wrapper.setMethods({ onDelegation: jest.fn(), onUndelegation: jest.fn() })
  })

  it(`renders validator information correctly`, () => {
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find(".page-profile__title").text()).toBe("mr_mounty")
    wrapper.find("#delegation-btn").trigger("click")
  })

  it(`renders validator information correctly when no avatar url`, () => {
    wrapper.setData({ validator: { avatarUrl: undefined } })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find("avatar-stub").exists()).toBe(true)
  })

  it(`triggers modal buttons`, () => {
    wrapper.find("#delegation-btn").trigger("click")
    expect(wrapper.vm.onDelegation).toHaveBeenCalled()

    wrapper.find("#undelegation-btn").trigger("click")
    expect(wrapper.vm.onUndelegation).toHaveBeenCalled()
  })

  it(`renders correct status colour`, () => {
    expect(wrapper.find(".page-profile__status.green").exists()).toBe(true)

    wrapper.setData({ validator: { status: 0 } })
    expect(wrapper.find(".page-profile__status.yellow").exists()).toBe(true)

    wrapper.setData({ validator: { jailed: true } })
    expect(wrapper.find(".page-profile__status.red").exists()).toBe(true)
  })

  it(`renders website correctly`, () => {
    expect(wrapper.find("#validator-website").text()).toBe(
      "https://www.monty.ca"
    )

    wrapper.setData({ validator: { website: "" } })
    expect(wrapper.element).toMatchSnapshot()
    expect(wrapper.find("#validator-website").exists()).toBe(false)
  })

  it(`renders website parameters`, () => {
    expect(wrapper.find("#page-profile__power").text()).toBe("0.33%")
    expect(wrapper.find("#page-profile__commission").text()).toBe("5.00%")

    // We no longer have missed bloks to calculate this
    // expect(wrapper.find("#page-profile__uptime").text()).toBe("")
  })
})
