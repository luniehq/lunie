import { shallowMount, createLocalVue } from "@vue/test-utils"
import LiProposal from "src/components/governance/LiProposal"

import { proposals } from "../../store/json/proposals"

describe(`LiProposal`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  let wrapper, proposalList

  beforeEach(() => {
    proposalList = Object.values(proposals)

    wrapper = shallowMount(LiProposal, {
      localVue,
      propsData: { proposal: proposalList[0] },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should return status info for passed proposals`, () => {
    expect(wrapper.find(".proposal-status").classes()).toContain("passed")
  })

  it(`should return status info for rejected proposals`, () => {
    wrapper.setProps({ proposal: proposalList[3] })
    expect(wrapper.find(".proposal-status").classes()).toContain("rejected")
  })

  it(`should return status info for active proposals`, () => {
    wrapper.setProps({ proposal: proposalList[1] })
    expect(wrapper.find(".proposal-status").classes()).toContain("votingperiod")
  })

  it(`should return status info for 'DepositPeriod' proposals`, () => {
    wrapper.setProps({ proposal: proposalList[2] })
    expect(wrapper.find(".proposal-status").classes()).toContain(
      "depositperiod"
    )
  })

  it(`should return status info for an unknown proposal type`, () => {
    const unknownProposal = Object.assign({}, proposalList[3])
    unknownProposal.proposal_status = "unknown"
    wrapper.setProps({ proposal: unknownProposal })
    const classes = wrapper.find(".proposal-status").classes()

    classes.forEach(className => {
      expect([
        "passed",
        "rejected",
        "votingperiod",
        "depositperiod"
      ]).not.toContain(className)
    })
  })

  it(`should not truncate a short description or add an ellipsis`, () => {
    wrapper.setProps({ proposal: proposalList[1] })
    expect(
      wrapper
        .find(".li-proposal-description")
        .text()
        .slice(-1)
    ).not.toBe("…")
  })

  it(`should truncate the description and add an ellipsis`, () => {
    wrapper.setProps({ proposal: proposalList[3] })
    expect(
      wrapper
        .find(".li-proposal-description")
        .text()
        .slice(-1)
    ).toBe("…")
  })
})
