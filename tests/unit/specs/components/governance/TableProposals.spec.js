import { mount, createLocalVue } from "@vue/test-utils"
import TableProposals from "governance/TableProposals"

import { proposals, tallies } from "../../store/json/proposals"

describe(`TableProposals`, () => {
  let wrapper, $store
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: {
        proposals: {
          proposals,
          tallies
        }
      }
    }

    wrapper = mount(TableProposals, {
      localVue,
      propsData: { proposals },
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should sort the proposals by selected property`, () => {
    wrapper.vm.sort.property = `proposal_id`
    wrapper.vm.sort.order = `asc`

    expect(wrapper.vm.filteredProposals[0].title).toEqual(proposals[`1`].title)

    wrapper.vm.sort.property = `proposal_id`
    wrapper.vm.sort.order = `desc`

    expect(wrapper.vm.filteredProposals[0].title).toEqual(proposals[`6`].title)
  })

  it(`should filter the proposals`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.filteredProposals[0].description).toBe(
      proposals[`6`].description
    )
  })
})
