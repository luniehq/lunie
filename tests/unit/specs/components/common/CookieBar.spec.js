import { shallowMount } from "@vue/test-utils"
import CookieBar from "common/CookieBar"

describe(`CookieBar`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      state: {
        session: {
          cookiesAccepted: false
        }
      }
    }

    wrapper = shallowMount(CookieBar, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`shows the cookie bar`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`can triggers cookie acceptance on close`, () => {
    const dispatch = jest.fn()
    CookieBar.methods.accept.call({
      $store: {
        dispatch
      }
    })
    expect(dispatch).toHaveBeenCalledWith(`setAnalyticsCollection`, true)
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, true)
    expect(dispatch).toHaveBeenCalledWith(`storeLocalPreferences`)
  })
})
