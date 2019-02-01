import setup from "../../../helpers/vuex-setup"
import TabParameters from "renderer/components/staking/TabParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

const { stakingParameters } = lcdClientMock.state

describe(`TabParameters`, () => {
  let wrapper, store
  const { mount } = setup()

  beforeEach(() => {
    const instance = mount(TabParameters, {
      stubs: {
        "tm-data-connecting": true,
        "tm-data-loading": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setConnected`, true)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    store.state.stakingParameters.loaded = true
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows the staking parameters`, () => {
    expect(store.state.stakingParameters.parameters).toEqual(
      stakingParameters.parameters
    )
  })

  it(`displays unbonding period in days`, () => {
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    expect(wrapper.vm.unbondingTimeInDays).toEqual(3)
  })

  it(`displays a message if waiting for connection`, () => {
    store.commit(`setConnected`, false)
    store.state.stakingParameters.loaded = false
    expect(wrapper.contains(`tm-data-connecting-stub`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    store.state.stakingParameters.loaded = true

    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-connecting-stub`)).toBe(false)
  })

  it(`displays a message if loading`, () => {
    store.commit(`setConnected`, true)
    store.state.stakingParameters.loaded = false
    store.state.stakingParameters.loading = true

    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-loading-stub`)).toBe(true)

    store.state.stakingParameters.loaded = true
    store.state.stakingParameters.loading = false

    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-loading-stub`)).toBe(false)
  })
})
