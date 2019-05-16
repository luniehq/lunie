import StepComponent from "common/StepComponent"
import { shallowMount } from "@vue/test-utils"

describe(`TmBtn`, () => {
  let wrapper
  beforeEach(async () => {
    const value = `button`
    wrapper = shallowMount(StepComponent, {
      propsData: { value }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`returns active class`, () => {
    wrapper.setProps({
      step: `Details`,
      stepName: `Details`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`returns textActive class`, () => {
    wrapper.setProps({
      step: `Details`,
      stepName: `Details`
    })
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
