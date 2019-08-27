import { shallowMount } from "@vue/test-utils"
import Page404 from "src/components/common/Page404"

describe(`Page404`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Page404, {
      stubs: [`router-link`]
    })
  })

  it(`should show the 404 page`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should show links to other pages`, () => {
    expect(wrapper.findAll(`router-link-stub`).length > 0).toBe(true)
  })
})
