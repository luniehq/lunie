import { shallowMount } from "@vue/test-utils"
import CardSignInRequired from "common/CardSignInRequired"

describe(`CardSignInRequired`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(CardSignInRequired)
  })

  it(`shows a sign in required card`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
