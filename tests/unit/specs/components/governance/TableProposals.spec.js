import { mount, createLocalVue } from "@vue/test-utils"
import TableProposals from "governance/TableProposals"

import { proposals } from "../../store/json/proposals"

describe(`TableProposals`, () => {
  let wrapper
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    wrapper = mount(TableProposals, {
      localVue,
      propsData: { proposals: Object.values(proposals) },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
