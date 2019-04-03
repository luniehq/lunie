import { shallowMount } from "@vue/test-utils"
import TmSessionLoading from "common/TmSessionLoading"

describe(`TmSessionLoading`, () => {
  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TmSessionLoading, {
      data: () => ({
        session: {
          network: `mock-net`
        }
      })
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show connection status`, () => {
    wrapper.setData({
      message: `HALLO WORLD`
    })
    expect(wrapper.html()).toContain(`HALLO WORLD`)
  })
})
