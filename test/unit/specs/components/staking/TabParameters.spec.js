import Vuelidate from "vuelidate"
import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabParameters from "renderer/components/staking/TabParameters"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let { pool, stakingParameters } = lcdClientMock.state

describe(`TabParameters`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(TabParameters, {
      localVue,
      stubs: {
        "tm-data-connecting": `<tm-data-connecting />`,
        "tm-data-loading": `<tm-data-loading />`
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setConnected`, true)
    store.commit(`setPool`, pool)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    store.state.stakingParameters.loaded = true
    store.state.pool.loaded = true
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows the staking parameters and pool`, () => {
    expect(store.state.stakingParameters.parameters).toEqual(
      stakingParameters.parameters
    )
    expect(store.state.pool.pool).toEqual(pool)
  })

  it(`displays unbonding period in days`, () => {
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    expect(wrapper.vm.unbondingTimeInDays).toEqual(3)
  })

  it(`displays a message if waiting for connection`, () => {
    store.commit(`setConnected`, false)
    store.state.stakingParameters.loaded = false
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-connecting`)).toBe(true)

    store.state.stakingParameters.loaded = true
    store.state.pool.loaded = false
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-connecting`)).toBe(true)
  })

  it(`displays a message if loading`, () => {
    let { wrapper, store } = mount(TabParameters, {
      localVue,
      stubs: {
        "tm-data-connecting": `<tm-data-connecting />`,
        "tm-data-loading": `<tm-data-loading />`
      }
    })
    store.commit(`setConnected`, true)
    store.state.stakingParameters.loaded = false
    store.state.stakingParameters.loading = true
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-loading`)).toBe(true)

    store.state.stakingParameters.loaded = true
    store.state.stakingParameters.loading = false
    store.state.pool.loaded = false
    store.state.pool.loading = true
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-loading`)).toBe(true)
  })
})
