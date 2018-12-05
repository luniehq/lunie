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
      doBefore: ({ store }) => {
        store.commit(`setConnected`, true)
        store.commit(`setPool`, pool)
        store.commit(`setStakingParameters`, stakingParameters)
      },
      stubs: {
        "tm-data-connecting": `<tm-data-connecting />`,
        "tm-data-loading": `<tm-data-loading />`
      }
    })
    wrapper = instance.wrapper
    store = instance.store
    store.state.stakingParameters.parameters.loaded = true
    store.state.pool.loaded = true
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
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
    store.state.stakingParameters.parameters.loaded = false
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-connecting`)).toBe(true)

    store.state.stakingParameters.parameters.loaded = true
    store.state.pool.loaded = false
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-connecting`)).toBe(true)
  })

  it(`displays a message if loading`, () => {
    store.commit(`setConnected`, true)
    store.state.stakingParameters.parameters.loaded = false
    store.state.stakingParameters.parameters.loading = true
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-loading`)).toBe(true)

    store.state.stakingParameters.parameters.loaded = true
    store.state.stakingParameters.parameters.loading = false
    store.state.pool.loaded = false
    store.state.pool.loading = true
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.exists(`tm-data-loading`)).toBe(true)
  })
})
