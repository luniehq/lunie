import Steps from "src/ActionModal/components/Steps"
import { mount } from "@vue/test-utils"

describe(`Steps`, () => {
  let wrapper
  beforeEach(async () => {
    wrapper = mount(Steps, {
      propsData: { steps: ["first", "second"], activeStep: "first" },
    })
  })

  it(`shows steps`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`sets a step active active class`, () => {
    expect(wrapper.find(".stepItem:first-child").classes()).toContain("active")
    wrapper.setProps({ activeStep: "second" })
    expect(wrapper.find(".stepItem:nth-child(2)").classes()).toContain("active")
  })
})
