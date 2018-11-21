import setup from "../../../helpers/vuex-setup"
import htmlBeautify from "html-beautify"
import TabValidators from "renderer/components/staking/TabValidators"

describe(`TabValidators`, () => {
  let wrapper
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(TabValidators)
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
