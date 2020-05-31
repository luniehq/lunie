import { mount } from "@vue/test-utils"
import TmFieldGroup from "common/TmFieldGroup"

describe(`TmFieldGroup`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TmFieldGroup, {
      slots: { default: `<input class="fake-field" placeholder="Fake" />` },
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`has a slot with a field`, () => {
    expect(wrapper.findAll(`.fake-field`).length).toBe(1)
  })
})
