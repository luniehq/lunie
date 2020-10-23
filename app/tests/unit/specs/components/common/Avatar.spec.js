import { shallowMount } from "@vue/test-utils"
import Avatar from "common/Avatar"

describe(`Avatar`, () => {
  it("should show an avatar", () => {
    const wrapper = shallowMount(Avatar, {
      propsData: {
        address: "cosmos1234",
      },
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
