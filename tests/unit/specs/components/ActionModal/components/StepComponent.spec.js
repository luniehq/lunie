import Steps from "src/ActionModal/components/Steps"
import { mount } from "@vue/test-utils"

describe(`Steps`, () => {
  let wrapper
  beforeEach(async () => {
    wrapper = mount(Steps, {
      propsData: { steps: ["first", "second"], activeStep: "first" }
    })
  })

  it(`shows steps`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`sets a step active active class`, () => {
    expect(
      wrapper.find(".stepItem:first-child .circle--default").classes()
    ).toContain("active")
    wrapper.setProps({ activeStep: "second" })
    expect(
      wrapper.find(".stepItem:nth-child(2) .circle--default").classes()
    ).toContain("active")
  })

  it(`doesn't add a line to the last circle`, () => {
    expect(
      wrapper.find(".stepItem:nth-child(1) .circle--default").classes()
    ).toContain("includeLine")
    expect(
      wrapper.find(".stepItem:nth-child(2) .circle--default").classes()
    ).not.toContain("includeLine")
  })
})
