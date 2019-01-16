import TmUserPane from "common/TmUserPane"
import { shallowMount } from "@vue/test-utils"

describe(`TmUserPane`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      getters: {
        user: {
          signedIn: true,
          account: `default`
        }
      }
    }

    wrapper = shallowMount(TmUserPane, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the active account name`, () => {
    expect(wrapper.html()).toContain(`default`)
  })

  it(`should not show the active account name if signed out`, async () => {
    wrapper.setData({
      user: {
        signedIn: false
      }
    })
    expect(wrapper.html()).toBeUndefined()
  })
})
