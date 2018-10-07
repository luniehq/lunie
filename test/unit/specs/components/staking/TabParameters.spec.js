import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabParameters from "renderer/components/staking/TabParameters"
// import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`TabParameters`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TabParameters)
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows the staking parameters`, async () => {
    await store.dispatch(`getParameters`)
    wrapper.update()
    expect(store.state.parameters).toBeDefined()
  })

  it(`shows the staking pool`, async () => {
    await store.dispatch(`getPool`)
    wrapper.update()
    expect(store.state.pool).toBeDefined()
  })
})
