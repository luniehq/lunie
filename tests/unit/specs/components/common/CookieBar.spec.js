import { shallowMount } from "@vue/test-utils"
import CookieBar from "common/CookieBar"

describe(`CookieBar`, () => {
  let wrapper, dispatch, $store

  beforeEach(async () => {
    dispatch = jest.fn()
    $store = {
      commit: jest.fn(),
      state: {
        session: {
          cookiesAccepted: false
        }
      },
      dispatch
    }

    wrapper = shallowMount(CookieBar, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`shows the cookie bar`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`can triggers cookie acceptance on close`, () => {
    wrapper.setData({ show: false });
    expect(dispatch).toHaveBeenCalledWith(`setAnalyticsCollection`, true)
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, true)
    expect(dispatch).toHaveBeenCalledWith(`storeLocalPreferences`)
  })
})
