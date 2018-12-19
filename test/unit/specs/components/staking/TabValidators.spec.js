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
        "tm-data-connecting": true,
        "tm-data-loading": true,
        "tm-data-empty": true
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    await store.dispatch(`getDelegates`)
  })

  it(`has the expected html structure`, async () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if still connecting`, async () => {
    store.state.delegates.loaded = false
    store.commit(`setConnected`, false)
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    store.state.delegates.loading = true
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    store.state.delegates.delegates = []
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
