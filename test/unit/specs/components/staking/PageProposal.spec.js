import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import { createLocalVue, mount } from "@vue/test-utils"

const proposal = lcdClientMock.state.proposals[0]

describe(`PageProposal`, () => {
  let wrapper, store
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(PageProposal, {
      propsData: {
        proposal
      }
    })
    wrapper = instance.wrapper
    wrapper.update()
  })

  it(`has the expected html structure`, async () => {
    // after importing the @tendermint/ui components from modules
    // the perfect scroll plugin needs a $nextTick and a wrapper.update
    // to work properly in the tests (snapshots weren't matching)
    // this has occured across multiple tests
    await wrapper.vm.$nextTick()
    wrapper.update()
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
