import Vuex from 'vuex'
import { mount, createLocalVue } from 'vue-test-utils'
import NiSession from 'common/NiSession'
const config = require('renderer/vuex/modules/config').default({})

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NiSessionWelcome', () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        config: () => config.state
      },
      modules: {config}
    })
    wrapper = mount(NiSession, {
      localVue,
      store,
      stubs: {
        'session-welcome': '<session-welcome />',
        'session-sign-up': '<session-sign-up />',
        'session-sign-in': '<session-sign-in />',
        'session-hardware': '<session-hardware />',
        'session-restore': '<session-restore />',
        'session-account-delete': '<session-account-delete />'
      }
    })
  })

  it('should not show by default', () => {
    expect(wrapper.isEmpty()).toBe(true)
  })

  it('should show a welcome screen if activated', () => {
    store.commit('setModalSession', true)
    wrapper.update()
    expect(wrapper.contains('session-welcome')).toBe(true)
  })

  it('should show a signup screen if selected', () => {
    store.commit('setModalSession', true)
    store.commit('setModalSessionState', 'sign-up')
    wrapper.update()
    expect(wrapper.contains('session-sign-up')).toBe(true)
  })

  it('should show a signin screen if selected', () => {
    store.commit('setModalSession', true)
    store.commit('setModalSessionState', 'sign-in')
    wrapper.update()
    expect(wrapper.contains('session-sign-in')).toBe(true)
  })

  it('should show a hardware signin screen if selected', () => {
    store.commit('setModalSession', true)
    store.commit('setModalSessionState', 'hardware')
    wrapper.update()
    expect(wrapper.contains('session-hardware')).toBe(true)
  })

  it('should show a account delete screen if selected', () => {
    store.commit('setModalSession', true)
    store.commit('setModalSessionState', 'delete')
    wrapper.update()
    expect(wrapper.contains('session-account-delete')).toBe(true)
  })

  // it('should show a restore screen if selected', () => {
  //   store.commit('setModalSession', true)
  //   store.commit('setModalSessionState', 'restore')
  //   wrapper.update()
  //   expect(wrapper.contains('session-restore')).toBe(true)
  // })
})
