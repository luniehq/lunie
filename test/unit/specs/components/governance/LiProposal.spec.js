import setup from "../../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import LiProposal from "renderer/components/governance/LiProposal"

let proposal = lcdClientMock.state.proposals[0]

describe(`LiProposal`, () => {
  let wrapper
  let { mount } = setup()

  beforeEach(() => {
    let instance = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper = instance.wrapper
    wrapper.update()
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should return status info for passed proposals`, () => {
    proposal.proposal_status = `Passed`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      button: null,
      message: `This proposal has passed`,
      color: `green`
    })
  })

  it(`should return status info for rejected proposals`, () => {
    proposal.proposal_status = `Rejected`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      button: null,
      message: `This proposal has been rejected and voting is closed`,
      color: `red`
    })
  })

  it(`should return status info for active proposals`, () => {
    proposal.proposal_status = `Active`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      button: `vote`,
      message: `Voting for this proposal is open`,
      color: `blue`
    })
  })

  it(`should return status info for pending proposals`, () => {
    proposal.proposal_status = `Pending`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      button: `deposit`,
      message: `Deposits are open for this proposal`,
      color: `yellow`
    })
  })
})
