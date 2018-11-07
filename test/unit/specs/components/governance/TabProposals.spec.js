import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabProposals from "renderer/components/governance/TabProposals"

describe(`TabProposals`, () => {
  let wrapper
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TabProposals)
    wrapper = instance.wrapper
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
})
