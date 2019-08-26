import { mount } from "@vue/test-utils"
import TmDataConnecting from "common/TmDataConnecting"

describe(`TmDataConnecting`, () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(TmDataConnecting)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
