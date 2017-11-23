import Vuex from 'vuex'
import { createLocalVue } from 'vue-test-utils'
import notifications from 'renderer/vuex/modules/notifications'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('Module: Notification', () => {
  let store

  beforeEach(() => {
    store = new Vuex.Store({
      modules: {
        notifications: notifications()
      }
    })
  })

  it('should add a notification object to the store', () => {
    store.commit('notify', {
      title: 'TitleA',
      body: 'BodyB'
    })
    expect(store.state.notifications.length).toBe(1)
    expect(store.state.notifications[0]).toMatchSnapshot()
  })
})
