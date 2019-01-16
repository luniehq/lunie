import { mount } from "@vue/test-utils"
import TmFieldAddon from "common/TmFieldAddon"

describe(`TmFieldAddon`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TmFieldAddon, {
      slots: { default: `<div class="fake-addon">ATOM</div>` }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`has a slot with content`, () => {
    expect(wrapper.findAll(`.fake-addon`).length).toBe(1)
  })
})
