import setup from "../../../helpers/vuex-setup"
import LiValidator from "renderer/components/staking/LiValidator"

describe(`LiValidator`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(LiValidator, {
      propsData: {
        validator: {
          id: `abc`,
          pub_key: `valpub123456789`,
          owner: `1a2b3c`,
          tokens: `19`,
          delegator_shares: `19`,
          description: {
            details: `Herr Schmidt`,
            website: `www.schmidt.de`,
            moniker: `herr_schmidt_revoked`,
            country: `DE`
          },
          revoked: false,
          status: 2,
          bond_height: `0`,
          bond_intra_tx_counter: 6,
          proposer_reward_pool: null,
          commission: `0.05`,
          commission_max: `0.1`,
          commission_change_rate: `0.01`,
          commission_change_today: `0.005`,
          prev_bonded_shares: `0`,
          voting_power: `10`,
          percent_of_vote: `22%`,
          signing_info: {
            start_height: 0,
            index_offset: 465400,
            jailed_until: `1970-01-01T00:00:00Z`,
            signed_blocks_counter: 9878
          }
        }
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.state.delegates.globalPower = 9000
    wrapper.update()
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should calculate the validator's power ratio`, () => {
    let ratio = wrapper.vm.validator.tokens / wrapper.vm.delegates.globalPower
    expect(wrapper.vm.powerRatio).toBe(ratio)
  })

  it(`should show the voting power`, () => {
    expect(wrapper.html()).toContain(`22%`)
  })

  it(`should show the validator status`, () => {
    expect(wrapper.vm.status).toBe(`This validator is actively validating`)
    // Jailed
    wrapper.vm.validator = {
      revoked: true
    }
    expect(wrapper.vm.status).toBe(
      `This validator has been jailed and is not currently validating`
    )
    // Is not a validator
    wrapper.vm.validator = {
      voting_power: 0
    }
    expect(wrapper.vm.status).toBe(
      `This validator has declared candidacy but does not have enough voting power yet`
    )
  })

  it(`should show the validator's uptime`, () => {
    expect(wrapper.vm.uptime).toBe(`98.78%`)
    expect(wrapper.html()).toContain(`98.78%`)

    wrapper.vm.validator.signing_info = null
    wrapper.update()

    expect(wrapper.vm.uptime).toBe(`n/a`)
  })

  it(`should show the validator's commission`, () => {
    expect(wrapper.html()).toContain(wrapper.vm.validator.commission)
  })

  it(`should show the type of the candidate`, () => {
    wrapper.vm.validator = {
      revoked: false,
      isValidator: false
    }
    expect(wrapper.vm.delegateType).toBe(`Candidate`)
    wrapper.vm.validator = {
      revoked: false,
      isValidator: true
    }
    expect(wrapper.vm.delegateType).toBe(`Validator`)
    wrapper.vm.validator = {
      revoked: true,
      isValidator: false
    }
    expect(wrapper.vm.delegateType).toBe(`Revoked`)
    wrapper.vm.validator = {
      revoked: true,
      isValidator: true
    }
    expect(wrapper.vm.delegateType).toBe(`Revoked`)
  })
})
