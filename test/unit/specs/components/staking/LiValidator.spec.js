import setup from "../../../helpers/vuex-setup"
import LiValidator from "renderer/components/staking/LiValidator"

describe(`LiValidator`, () => {
  let wrapper, store, delegate
  let instance = setup()

  beforeEach(async () => {
    let test = instance.mount(LiValidator, {
      propsData: {
        delegate: {
          id: `abc`,
          description: {}
        }
      }
    })
    wrapper = test.wrapper
    store = test.store

    store.commit(`setAtoms`, 1337)
    await store.dispatch(`getDelegates`)
    delegate = store.state.delegates.delegates[0]
    delegate.percent_of_vote = `22%`
    delegate.signing_info = {
      start_height: 0,
      index_offset: 465400,
      jailed_until: `1970-01-01T00:00:00Z`,
      signed_blocks_counter: 9878
    }
    wrapper.setData({ delegate })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should calculate the validator's power ratio`, () => {
    let ratio = wrapper.vm.delegate.tokens / wrapper.vm.delegates.globalPower
    expect(wrapper.vm.powerRatio).toBe(ratio)
  })

  it(`should show the voting power`, () => {
    expect(wrapper.html()).toContain(`22%`)
  })

  it(`should show the validator status`, () => {
    expect(wrapper.vm.status).toBe(`This validator is actively validating`)
    // Jailed
    wrapper.vm.delegate = {
      revoked: true
    }
    expect(wrapper.vm.status).toBe(
      `This validator has been jailed and is not currently validating`
    )
    // Is not a validator
    wrapper.vm.delegate = {
      voting_power: 0
    }
    expect(wrapper.vm.status).toBe(
      `This validator has declared candidacy but does not have enough voting power yet`
    )
  })

  it(`should show the validator's uptime`, () => {
    expect(wrapper.vm.uptime).toBe(`98.78%`)
    expect(wrapper.html()).toContain(`98.78%`)
  })

  it(`should show the validator's comission`, () => {
    expect(wrapper.html()).toContain(`0%`)
  })

  it(`should show the type of the candidate`, () => {
    wrapper.vm.delegate = {
      revoked: false,
      isValidator: false
    }
    expect(wrapper.vm.delegateType).toBe(`Candidate`)
    wrapper.vm.delegate = {
      revoked: false,
      isValidator: true
    }
    expect(wrapper.vm.delegateType).toBe(`Validator`)
    wrapper.vm.delegate = {
      revoked: true,
      isValidator: false
    }
    expect(wrapper.vm.delegateType).toBe(`Revoked`)
    wrapper.vm.delegate = {
      revoked: true,
      isValidator: true
    }
    expect(wrapper.vm.delegateType).toBe(`Revoked`)
  })
})
