import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import Vuelidate from "vuelidate"
import PageGovernance from "renderer/components/governance/PageGovernance"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

describe(`PageGovernance`, () => {
  let wrapper, store
  let { mount, localVue } = setup()
  localVue.use(Vuelidate)

  beforeEach(() => {
    let instance = mount(PageGovernance)
    wrapper = instance.wrapper
    store = instance.store
    store.commit(`setConnected`, true)
    store.state.user.address = lcdClientMock.addresses[0]
    store.commit(`setAtoms`, 1337)
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

  it(`should show the search on click`, () => {
    wrapper.find(`.tm-tool-bar i.search`).trigger(`click`)
    expect(wrapper.contains(`.tm-modal-search`)).toBe(true)
  })
})
