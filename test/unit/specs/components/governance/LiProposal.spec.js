import { shallow } from "@vue/test-utils"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import LiProposal from "renderer/components/governance/LiProposal"

describe(`LiProposal`, () => {
  let wrapper
  const propsData = {
    proposal: lcdClientMock.state.proposals[0]
  }

  beforeEach(() => {
    wrapper = shallow(LiProposal, { propsData })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
