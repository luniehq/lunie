import { shallowMount } from "@vue/test-utils"
import Tabs from "src/components/common/Tabs"

describe(`Tabs`, () => {
  let wrapper
  it(`has the expected html structure`, async () => {
    wrapper = shallowMount(Tabs, {})
    expect(wrapper.findAll(`.tabs .tab`).length).toBe(0)
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    wrapper = shallowMount(Tabs, {
      propsData: {
        tabs: [{ pathName: `r1`, displayName: `one` }]
      },
      mocks: {
        $route: {
          name: `r1`
        }
      },
      stubs: [`router-link`]
    })
    expect(wrapper.findAll(`.tabs .tab`).length).toBe(1)
    expect(wrapper.element).toMatchSnapshot()
  })
})
