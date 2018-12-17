import { mount } from "@vue/test-utils"
import PageProfile from "renderer/components/common/PageProfile"

describe(`PageProfile`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(PageProfile)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
