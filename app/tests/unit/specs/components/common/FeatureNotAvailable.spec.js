import { mount } from "@vue/test-utils"
import FeatureNotAvailable from "common/FeatureNotAvailable"

describe(`FeatureNotAvailable`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(FeatureNotAvailable, {
      propsData: {
        feature: "Spacetravel",
      },
    })
  })

  it(`shows a warning about a feature not being available`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
