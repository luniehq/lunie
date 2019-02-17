import { shallowMount } from "@vue/test-utils"
import TmSession from "common/TmSession"

describe(`TmSessionWelcome`, () => {
  let wrapper, $store

  beforeEach(() => {
    const getters = {
      session: {
        modals: {
          session: {
            state: `loading`
          }
        }
      }
    }

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }
    wrapper = shallowMount(TmSession, {
      mocks: {
        $store
      }
    })
  })

  it(`should show by default`, () => {
    expect(wrapper.isEmpty()).toBe(false)
  })

  it(`should show a loading screen if activated`, () => {
    expect(wrapper.contains(`session-loading-stub`)).toBe(true)
  })

  it(`should show a welcome screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `welcome`
    expect(wrapper.contains(`session-welcome-stub`)).toBe(true)
  })

  it(`should show a signup screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `sign-up`
    expect(wrapper.contains(`session-sign-up-stub`)).toBe(true)
  })

  it(`should show a signin screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `sign-in`
    expect(wrapper.contains(`session-sign-in-stub`)).toBe(true)
  })

  it(`should show a hardware signin screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `hardware`
    expect(wrapper.contains(`session-hardware-stub`)).toBe(true)
  })

  it(`should show a import screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `import`
    expect(wrapper.contains(`session-import-stub`)).toBe(true)
  })

  it(`should show a import screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `delete`
    expect(wrapper.contains(`session-account-delete-stub`)).toBe(true)
  })

  it(`should show a the connected network indicator`, () => {
    expect(wrapper.contains(`connected-network-stub`)).toBe(true)
  })
})
