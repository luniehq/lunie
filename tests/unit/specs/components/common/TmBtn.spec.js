import TmBtn from "common/TmBtn"
import { shallowMount } from "@vue/test-utils"

describe(`TmBtn`, () => {
  let wrapper
  beforeEach(async () => {
    const value = `button`
    wrapper = shallowMount(TmBtn, {
      propsData: { value }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`displays as a link`, () => {
    wrapper.setProps({
      type: `link`,
      to: `/stake`
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`displays as an external link`, () => {
    wrapper.setProps({
      type: `anchor`
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`displays as an icon`, () => {
    wrapper.setProps({
      icon: `search`
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`displays as an img as an icon`, () => {
    wrapper.setProps({
      img: `./icon.png`
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`allows for customization`, () => {
    wrapper.setProps({
      iconPos: `right`,
      size: `sm`,
      color: `danger`
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
