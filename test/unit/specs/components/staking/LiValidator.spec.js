import { shallowMount, createLocalVue } from "@vue/test-utils"
import LiValidator from "renderer/components/staking/LiValidator"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => { })

describe(`LiValidator`, () => {
  let wrapper, $store

  const validator = {
    operator_address: `cosmosvaladdr15ky9du8a2wlstz6fpx3p4mqpjyrm5ctplpn3au`,
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
      rate: `0.05`,
      max_rate: `0.1`,
      max_change_rate: `0.005`,
      update_time: `1970-01-01T00:00:00Z`
    },
    prev_bonded_shares: `0`,
    voting_power: `10`,
    percent_of_vote: `22%`,
    signing_info: {
      start_height: 0,
      index_offset: 465400,
      jailed_until: `1970-01-01T00:00:00Z`,
      missed_blocks_counter: 122
    }
  }

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        delegates: { delegates: [], globalPower: 9000 },
        committedDelegations: {},
        distribution: {
          rewards: {
          }
        },
        session: {
          signedIn: true
        },
        bondDenom: `stake`,
        lastHeader: ``
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

  it(`should calculate the validator's power ratio`, () => {
    const ratio = wrapper.vm.validator.tokens / wrapper.vm.delegates.globalPower
    expect(wrapper.vm.powerRatio).toBe(ratio)
  })

  it(`should show the voting power`, () => {
    expect(wrapper.html()).toContain(`22%`)
  })

  it(`should show the validator status`, () => {
    expect(wrapper.vm.status).toBe(`This validator is actively validating`)
    // Jailed
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: true
      })
    })
    expect(wrapper.vm.status).toBe(
      `This validator has been jailed and is not currently validating`
    )
    // Is not a validator
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: false,
        voting_power: 0
      })
    })
    expect(wrapper.vm.status).toBe(
      `This validator does not have enough voting power yet and is inactive`
    )
  })

  it(`should show the validator status with color`, () => {
    expect(wrapper.vm.statusColor).toBe(`green`)
    // Jailed
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: true
      })
    })
    expect(wrapper.vm.statusColor).toBe(`red`)
    // Is not a validator
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: false,
        voting_power: 0
      })
    })
    expect(wrapper.vm.statusColor).toBe(`yellow`)
  })

  it(`should show the validator's uptime`, () => {
    expect(wrapper.vm.uptime).toBe(`98.78%`)
    expect(wrapper.html()).toContain(`98.78%`)

    wrapper.setProps({
      validator: Object.assign({}, validator, {
        signing_info: null
      })
    })

    expect(wrapper.vm.uptime).toBe(`--`)
  })

  it(`should show the validator's commission`, () => {
    expect(wrapper.html()).toContain(wrapper.vm.validator.commission.rate)
  })

  it(`should show the type of the candidate`, () => {
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: false,
        isValidator: false
      })
    })
    expect(wrapper.vm.delegateType).toBe(`Candidate`)
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: false,
        isValidator: true
      })
    })
    expect(wrapper.vm.delegateType).toBe(`Validator`)
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: true,
        isValidator: false
      })
    })
    expect(wrapper.vm.delegateType).toBe(`Revoked`)
    wrapper.setProps({
      validator: Object.assign({}, validator, {
        revoked: true,
        isValidator: true
      })
    })
    expect(wrapper.vm.delegateType).toBe(`Revoked`)
  })

  it(`shows rewards`, () => {
    $store.getters.distribution.rewards = {
      [validator.operator_address]: {
        stake: 1230000000
      }
    }

    expect(wrapper.find(`.li-validator__rewards`).html()).toContain(`123.0000…`)
  })

  it(`works if user is not signed in`, () => {
    $store.getters.session.signedIn = false

    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
