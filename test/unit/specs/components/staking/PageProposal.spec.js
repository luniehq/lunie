import setup from "../../../helpers/vuex-setup"
import PageProposal from "renderer/components/governance/PageProposal"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

let proposal = lcdClientMock.state.proposals[0]

describe(`PageProposal`, () => {
  let wrapper
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

  it(`should return the block number`, () => {
    expect(wrapper.vm.voteBlock).toBe(`block #135`)
  })

  it(`should return the end of the sentence`, () => {
    proposal.submit_block = `135`
    let { wrapper } = mount(PageProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.voteBlock).toBe(`the same block`)
  })

  it(`should return status info for passed proposals`, () => {
    proposal.proposal_status = `Passed`
    let { wrapper } = mount(PageProposal, {
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
    let { wrapper } = mount(PageProposal, {
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
    let { wrapper } = mount(PageProposal, {
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
    let { wrapper } = mount(PageProposal, {
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

  it(`should return an error message when proposal status is unknown`, () => {
    proposal.proposal_status = undefined
    let { wrapper } = mount(PageProposal, {
      propsData: {
        proposal
      }
    })
    wrapper.update()
    expect(wrapper.vm.status).toEqual({
      button: null,
      message: `There was an error determining the status of this proposal`,
      color: `grey`
    })
  })
})
