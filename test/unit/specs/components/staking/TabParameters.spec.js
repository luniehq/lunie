import setup from "../../../helpers/vuex-setup"
import TabParameters from "renderer/components/staking/TabParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let { pool, stakingParameters } = lcdClientMock.state

describe(`TabParameters`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TabParameters, {
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.commit(`setPool`, pool)
        store.commit(`setStakingParameters`, stakingParameters)
      },
      stubs: {
        "tm-data-connecting": true,
        "tm-data-loading": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.stakingParameters.loaded = true
    store.state.pool.loaded = true
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`shows the staking parameters and pool`, () => {
    expect(store.state.stakingParameters.parameters).toEqual(stakingParameters)
    expect(store.state.pool.pool).toEqual(pool)
  })

  it(`displays unbonding period in days`, () => {
    expect(wrapper.vm.unbondingTimeInDays).toEqual(3)
  })

  it(`displays a message if waiting for connection`, () => {
    store.commit(`setConnected`, false)
    store.state.stakingParameters.loaded = false
    expect(wrapper.contains(`tm-data-connecting-stub`)).toBe(true)
    expect(wrapper.vm.$el).toMatchSnapshot()

    store.state.stakingParameters.loaded = true
    store.state.pool.loaded = false
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-connecting-stub`)).toBe(true)
  })

  it(`displays a message if loading`, () => {
    store.commit(`setConnected`, true)
    store.state.stakingParameters.loaded = false
    store.state.stakingParameters.loading = true
    store.state.pool.loaded = true
    store.state.pool.loading = true
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-loading-stub`)).toBe(true)

    store.state.stakingParameters.loaded = true
    store.state.stakingParameters.loading = false
    store.state.pool.loaded = false
    store.state.pool.loading = true
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.contains(`tm-data-loading-stub`)).toBe(true)
  })
})
