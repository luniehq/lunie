import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabProposals from "renderer/components/governance/TabProposals"

describe(`TabProposals`, () => {
  let wrapper
  let store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TabProposals, {
      doBefore: async ({ store }) => {
        store.commit(`setConnected`, true)
      },
      stubs: {
        "tm-data-connecting": `<tm-data-connecting />`,
        "tm-data-loading": `<tm-data-loading />`
      }
    })
    wrapper = instance.wrapper
    store = instance.store

    // store.state.proposals.loaded = true
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

  it(`shows a message if still connecting`, async () => {
    store.state.proposals.loaded = false
    store.commit(`setConnected`, false)
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if still loading`, async () => {
    store.state.proposals.loaded = false
    store.state.proposals.loading = true
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it(`shows a message if there is nothing to display`, async () => {
    store.state.proposals.proposals = {}
    wrapper.update()
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
