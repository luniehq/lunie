import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabValidators from "renderer/components/staking/TabValidators"

describe(`TabValidators`, () => {
  let wrapper
  let store
  let { mount } = setup()

  beforeEach(async () => {
    let instance = mount(TabValidators, {
      stubs: {
        "tm-data-connecting": `<tm-data-connecting />`,
        "tm-data-loading": `<tm-data-loading />`,
        "tm-data-empty": `<tm-data-empty />`
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    await store.dispatch(`getDelegates`)
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

  it(`shows a message if still connecting`, async () => {
    store.state.delegates.loaded = false
    store.commit(`setConnected`, false)
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    store.state.delegates.loading = true
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    store.state.delegates.delegates = []
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
