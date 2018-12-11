import setup from "../../../helpers/vuex-setup"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"
import LiProposal from "renderer/components/governance/LiProposal"

let proposal = lcdClientMock.state.proposals[`1`]

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
      message: `This proposal has passed`
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
      message: `This proposal has been rejected and voting is closed`,
      color: `red`
    })
  })

  it(`should return status info for active proposals`, () => {
    proposal.proposal_status = `VotingPeriod`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      message: `Voting for this proposal is open`,
      color: `green`
    })
  })

  it(`should return status info for 'DepositPeriod' proposals`, () => {
    proposal.proposal_status = `DepositPeriod`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      message: `Deposits are open for this proposal`,
      color: `yellow`
    })
  })

  it(`should return status info for an unknown proposal type`, () => {
    proposal.proposal_status = `Unknown`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      message: `There was an error determining the status of this proposal.`,
      color: `grey`
    })
  })

  it(`should not truncate the description or add an ellipsis`, () => {
    expect(wrapper.vm.description).toEqual(`Proposal description`)
  })

  it(`should truncate the description and add an ellipsis`, () => {
    proposal.description = `this is some kind of long description. longer than 100 characters for optimum-maximum-ideal truncation.`
    let { wrapper } = mount(LiProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.description).toEqual(
      `this is some kind of long description. longer than 100 characters for optimum-maximum-ideal truncati…`
    )
  })
})
