import { mount } from "@vue/test-utils"
import NiPageHeader from "common/NiPageHeader"

describe("NiPageHeader", () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(NiPageHeader)
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
