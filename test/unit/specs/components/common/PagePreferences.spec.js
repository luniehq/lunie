import { shallowMount } from "@vue/test-utils"
import PagePreferences from "renderer/components/common/PagePreferences"

jest.mock(`renderer/google-analytics.js`, () => () => {})

describe(`PagePreferences`, () => {
  let wrapper, $store

  const getters = {
    session: {
      address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
      errorCollection: false
    },
    onboarding: {},
    mockedConnector: false,
    nodeUrl: `http://localhost:9070`
  }

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }

    wrapper = shallowMount(PagePreferences, {
      mocks: {
        $store
      }
    })
  })

  it(`has the expected html structure if connected`, async () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.$el.outerHTML).toContain(`Node IP`)
    expect(wrapper.vm.$el.outerHTML).toContain(`View tutorial`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Automatically send`)
  })

  it(`should set the error collection opt in`, async () => {
    const errorCollection = wrapper.vm.session.errorCollection
    const dispatch = jest.fn()
    wrapper.vm.setErrorCollection({
      $store: {
        dispatch
      }
    })
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, {
      address: `cosmos15ky9du8a2wlstz6fpx3p4mqpjyrm5ctpesxxn9`,
      optin: !errorCollection
    })
  })

  it(`can show onboarding again`, () => {
    wrapper.find(`#toggle-onboarding`).trigger(`click`)
    expect($store.commit).toHaveBeenCalledWith(`setOnboardingState`, 0)
    expect($store.commit).toHaveBeenCalledWith(`setOnboardingActive`, true)
    expect(wrapper.find(`#onboarding`)).toBeDefined()
  })
})
