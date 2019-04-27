import Vuex from "vuex"
import { createLocalVue } from "@vue/test-utils"
import notifications from "src/vuex/modules/notifications"

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`Module: Notification`, () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({ modules: { notifications: notifications() } })
  })

  it(`should add a notification object to the store`, () => {
    store.commit(`notify`, {
      title: `TitleA`,
      body: `BodyB`
    })
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it(`should add a warning object to the store`, () => {
    store.commit(`notifyWarn`, {
      title: `TitleA`,
      body: `BodyB`
    })
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it(`should add an signup notification to the store`, () => {
    store.commit(`notifySignUp`)
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it(`should add an signin notification to the store`, () => {
    store.commit(`notifySignIn`)
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it(`should add an signout notification to the store`, () => {
    store.commit(`notifySignOut`)
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })

  it(`should add an authentication required notification to the store`, () => {
    store.commit(`notifyAuthRequired`)
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()

    // allow body to be defined to give user source of auth decline
    store.commit(`notifyAuthRequired`, `Some text`)
    expect(store.state.notifications.length).toBe(2)
    expect(store.state.notifications[1].body).toBe(`Some text`)
  })
})
