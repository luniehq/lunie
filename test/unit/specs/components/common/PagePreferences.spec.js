import { shallowMount } from "@vue/test-utils"
import PagePreferences from "renderer/components/common/PagePreferences"

jest.mock(`renderer/google-analytics.js`, () => () => {})

describe(`PagePreferences`, () => {
  let wrapper, $store

  const getters = {
    user: {
      account: `default`,
      errorCollection: false
    },
    onboarding: {},
    mockedConnector: false,
    nodeURL: `http://localhost:9070`
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
    expect(wrapper.vm.$el.outerHTML).toContain(`View tutorial`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Automatically send`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Switch account`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Sign Out`)
  })

  it(`should sign the user out`, async () => {
    wrapper.vm.signOut()
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
    expect($store.commit).toHaveBeenCalledWith(`notifySignOut`)
  })

  it(`should set the error collection opt in`, async () => {
    let errorCollection = wrapper.vm.user.errorCollection
    const dispatch = jest.fn()
    wrapper.vm.setErrorCollection({
      $store: {
        dispatch
      }
    })
    expect(dispatch).toHaveBeenCalledWith(`setErrorCollection`, {
      account: `default`,
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
