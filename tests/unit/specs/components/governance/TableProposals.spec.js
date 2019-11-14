import { mount, createLocalVue } from "@vue/test-utils"
import TableProposals from "governance/TableProposals"

import { proposals } from "../../store/json/proposals"

describe(`TableProposals`, () => {
  let wrapper, $store
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn()
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
    expect(wrapper.element).toMatchSnapshot()
  })
})
