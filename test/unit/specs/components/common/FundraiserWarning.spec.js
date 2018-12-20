import { shallowMount } from "@vue/test-utils"
import FundraiserWarning from "renderer/components/common/FundraiserWarning"

describe(`FundraiserWarning`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(FundraiserWarning)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
