import setup from "../../../helpers/vuex-setup"
import PagePreferences from "renderer/components/common/PagePreferences"
import lcdClientMock from "renderer/connectors/lcdClientMock.js"

jest.mock(`renderer/google-analytics.js`, () => () => {})

describe(`PagePreferences`, () => {
  let wrapper, store
  const { stakingParameters } = lcdClientMock.state
  const { mount } = setup()

  beforeEach(async () => {
    const instance = mount(PagePreferences)
    wrapper = instance.wrapper
    store = instance.store

    store.commit(`setConnected`, true)
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
  })

  it(`has the expected html structure if connected`, async () => {
    store.commit(`setStakingParameters`, stakingParameters.parameters)
    expect(wrapper.vm.$el).toMatchSnapshot()
    expect(wrapper.vm.$el.outerHTML).toContain(`View tutorial`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Automatically send`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Switch account`)
    expect(wrapper.vm.$el.outerHTML).toContain(`Sign Out`)
  })

  it(`should sign the user out`, async () => {
    wrapper.vm.signOut()
    expect(store.dispatch).toHaveBeenCalledWith(`signOut`)
    expect(store.commit).toHaveBeenCalledWith(`notifySignOut`)
  })

  it(`should set the error collection opt in`, async () => {
    const errorCollection = wrapper.vm.user.errorCollection
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

  it(`can switch the theme`, () => {
    wrapper.vm.setAppTheme()
    expect(store.commit).toHaveBeenCalledWith(`setTheme`, `light`)
    expect(store.state.themes.active).toBe(`light`)
    // store.commit.mockClear()
    wrapper.vm.setAppTheme()
    expect(store.commit).toHaveBeenCalledWith(`setTheme`, `dark`)
    expect(store.state.themes.active).toBe(`dark`)
  })

  it(`can show onboarding again`, () => {
    wrapper.find(`#toggle-onboarding`).trigger(`click`)
    expect(store.commit).toHaveBeenCalledWith(`setOnboardingState`, 0)
    expect(store.commit).toHaveBeenCalledWith(`setOnboardingActive`, true)
    expect(wrapper.find(`#onboarding`)).toBeDefined()
  })
})
