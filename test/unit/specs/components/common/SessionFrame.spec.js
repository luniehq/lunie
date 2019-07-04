import { shallowMount } from "@vue/test-utils"
import SessionFrame from "common/SessionFrame"

describe(`SessionFrame`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SessionFrame, {
      stubs: [`router-link`]
    })
  })

  it(`shows an overview of all wallets to sign in with from the extension`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
