import { mount } from "@vue/test-utils"
import TextBlock from "common/TextBlock"

describe(`TextBlock`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TextBlock, {
      propsData: {
        content: `Hello World`,
        author: `faboweb`
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
