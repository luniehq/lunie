import { shallowMount } from "@vue/test-utils"
import Menu from "common/Menu"

describe(`Menu`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(Menu)
  })

  it("should show a the menus for mobile and desktop", () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
