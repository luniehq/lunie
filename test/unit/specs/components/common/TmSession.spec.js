import Vuex from "vuex"
import { mount, createLocalVue } from "@vue/test-utils"
import TmSession from "common/TmSession"
const config = require(`renderer/vuex/modules/config`).default({})

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionWelcome`, () => {
  let wrapper, store

  beforeEach(() => {
    store = new Vuex.Store({
      getters: {
        config: () => config.state,
        lastHeader: () => ({ chain_id: `gaia-test`, height: `31337` }),
        connected: () => true,
        nodeURL: () => `http://nodeUrl`,
        mockedConnector: () => false
      },
      modules: { config }
    })
    wrapper = mount(TmSession, {
      localVue,
      store,
      stubs: {
        "session-loading": true,
        "session-welcome": true,
        "session-sign-up": true,
        "session-sign-in": true,
        "session-hardware": true,
        "session-import": true,
        "session-account-delete": true
      }
    })
  })

  it(`should show by default`, () => {
    expect(wrapper.isEmpty()).toBe(false)
  })

  it(`should show a loading screen if activated`, () => {
    store.commit(`setModalSession`, true)
    expect(wrapper.contains(`session-loading-stub`)).toBe(true)
  })

  it(`should show a welcome screen if selected`, () => {
    store.commit(`setModalSession`, true)
    store.commit(`setModalSessionState`, `welcome`)
    expect(wrapper.contains(`session-welcome-stub`)).toBe(true)
  })

  it(`should show a signup screen if selected`, () => {
    store.commit(`setModalSession`, true)
    store.commit(`setModalSessionState`, `sign-up`)
    expect(wrapper.contains(`session-sign-up-stub`)).toBe(true)
  })

  it(`should show a signin screen if selected`, () => {
    store.commit(`setModalSession`, true)
    store.commit(`setModalSessionState`, `sign-in`)
    expect(wrapper.contains(`session-sign-in-stub`)).toBe(true)
  })

  it(`should show a hardware signin screen if selected`, () => {
    store.commit(`setModalSession`, true)
    store.commit(`setModalSessionState`, `hardware`)
    expect(wrapper.contains(`session-hardware-stub`)).toBe(true)
  })

  it(`should show a account delete screen if selected`, () => {
    store.commit(`setModalSession`, true)
    store.commit(`setModalSessionState`, `delete`)
    expect(wrapper.contains(`session-account-delete-stub`)).toBe(true)
  })

  // it('should show a import screen if selected', () => {
  //   store.commit('setModalSession', true)
  //   store.commit('setModalSessionState', 'import')
  //   expect(wrapper.contains('session-import')).toBe(true)
  // })
})
