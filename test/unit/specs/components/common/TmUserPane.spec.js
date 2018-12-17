import TmUserPane from "common/TmUserPane"
import TmListItem from "common/TmListItem"
import setup from "../../../helpers/vuex-setup"

describe(`TmUserPane`, () => {
  let wrapper, router, store, instance
  let { mount } = setup()

  beforeEach(async () => {
    instance = mount(TmUserPane)
    store = instance.store
    router = instance.router
    wrapper = instance.wrapper
    await store.dispatch(`signIn`, {
      account: `default`,
      password: `1234567890`
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should show the active account name`, () => {
    expect(wrapper.html()).toContain(`default`)
  })

  it(`should not show the active account name if signed out`, async () => {
    await store.dispatch(`signOut`)
    expect(wrapper.html()).toBeUndefined()
  })

  it(`should redirect to the preferences page if signed in`, () => {
    wrapper.find(TmListItem).trigger(`click`)
    expect(router.currentRoute.path).toBe(`/preferences`)
  })
})
