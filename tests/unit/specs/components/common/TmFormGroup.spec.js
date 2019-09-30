import { mount } from "@vue/test-utils"
import TmFormGroup from "common/TmFormGroup"

describe(`TmFormGroup`, () => {
  let wrapper

  const propsData = {
    error: true,
    fieldId: `sign-in-password`,
    fieldLabel: `Sign In Password`
  }

  beforeEach(() => {
    wrapper = mount(TmFormGroup, {
      propsData,
      slots: { default: `<input class="fake-field" value="fake" />` }
    })
  })

  it(`has a field id from props`, () => {
    expect(wrapper.vm.fieldId).toBe(`sign-in-password`)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`shows the label of the field`, () => {
    expect(
      wrapper
        .find(`.tm-form-group__label`)
        .text()
        .trim()
    ).toBe(`Sign In Password`)
  })

  it(`has a slot with a field`, () => {
    expect(wrapper.findAll(`.fake-field`).length).toBe(1)
  })
})
