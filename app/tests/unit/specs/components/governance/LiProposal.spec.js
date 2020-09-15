import { shallowMount, createLocalVue } from "@vue/test-utils"
import LiProposal from "src/components/governance/LiProposal"

import { proposals } from "../../store/json/proposals"

const proposal = proposals[`1`]

describe(`LiProposal`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  let wrapper

  beforeEach(() => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
    }

    wrapper = shallowMount(LiProposal, {
      localVue,
      mocks: {
        $store,
      },
      propsData: { proposal },
      stubs: [`router-link`],
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should return status info for passed proposals`, () => {
    wrapper.setProps({
      proposal: {
        ...proposal,
        status: `Passed`,
      },
    })
    expect(wrapper.vm.status).toEqual({
      title: `Passed`,
      value: `PASSED`,
      color: `green`,
    })
  })

  it(`should return status info for rejected proposals`, () => {
    wrapper.setProps({
      proposal: {
        ...proposal,
        status: `Rejected`,
      },
    })
    expect(wrapper.vm.status).toEqual({
      title: `Rejected`,
      value: `REJECTED`,
      color: `red`,
    })
  })

  it(`should return status info for active proposals`, () => {
    wrapper.setProps({
      proposal: {
        ...proposal,
        status: `VotingPeriod`,
      },
    })
    expect(wrapper.vm.status).toEqual({
      title: `Voting Period`,
      value: `VOTING`,
      color: `highlight`,
    })
  })

  it(`should return status info for 'DepositPeriod' proposals`, () => {
    wrapper.setProps({
      proposal: {
        ...proposal,
        status: `DepositPeriod`,
      },
    })
    expect(wrapper.vm.status).toEqual({
      title: `Deposit Period`,
      value: `DEPOSITING`,
      color: `orange`,
    })
  })

  it(`should return status info for an unknown proposal type`, () => {
    wrapper.setProps({
      proposal: {
        ...proposal,
        status: `Unknown`,
      },
    })
    expect(wrapper.vm.status).toEqual({
      title: `Error`,
      value: `UNKNOWN`,
      color: `grey`,
    })
  })

  it(`should survive the tally result not being present yet`, () => {
    const $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      state: {
        proposals: {
          tallies: {},
        },
      },
    }

    wrapper = shallowMount(LiProposal, {
      localVue,
      mocks: {
        $store,
      },
      propsData: { proposal },
      stubs: [`router-link`],
    })

    expect(wrapper.element).toMatchSnapshot()
  })
})
