import { mount } from "@vue/test-utils"
import PageFeatureNotAvailable from "common/PageFeatureNotAvailable"

describe(`PageFeatureNotAvailable`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PageFeatureNotAvailable, {
      propsData: {
        feature: "Spacetravel"
      },
      stubs: ["router-link"]
    })
  })

  it(`shows a warning about a feature not being available`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
