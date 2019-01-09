import { mount } from "@vue/test-utils"
import TmSessionLoading from "common/TmSessionLoading"

describe(`TmSessionLoading`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TmSessionLoading)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show connection status`, () => {
    expect(wrapper.html()).toContain(`HALLO WORLD`)
  })
})
