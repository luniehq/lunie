import { shallowMount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import FundraiserWarning from "renderer/components/common/FundraiserWarning"

describe(`FundraiserWarning`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(FundraiserWarning)
  })

  it(`has the expected html structure`, () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })
})
