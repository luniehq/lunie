import { shallowMount } from "@vue/test-utils"
import TmSession from "common/TmSession"

describe(`TmSession`, () => {
  let wrapper, $store

  beforeEach(() => {
    const getters = {
      session: {
        modals: {
          session: {
            state: `welcome`,
            active: true
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

  it(`should show a welcome screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `welcome`
    expect(wrapper.contains(`SessionWelcome-stub`)).toBe(true)
  })

  it(`should show a signup screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `sign-up`
    expect(wrapper.contains(`SessionSignUp-stub`)).toBe(true)
  })

  it(`should show a signin screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `sign-in`
    expect(wrapper.contains(`SessionSignIn-stub`)).toBe(true)
  })

  it(`should show a hardware signin screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `hardware`
    expect(wrapper.contains(`SessionHardware-stub`)).toBe(true)
  })

  it(`should show a import screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `import`
    expect(wrapper.contains(`SessionImport-stub`)).toBe(true)
  })

  it(`should show a import screen if selected`, () => {
    wrapper.vm.session.modals.session.state = `delete`
    expect(wrapper.contains(`SessionAccountDelete-stub`)).toBe(true)
  })

  it(`should show a the connected network indicator`, () => {
    expect(wrapper.contains(`ConnectedNetwork-stub`)).toBe(true)
  })

  it(`should close the session modal`, () => {
    wrapper.vm.close()
    expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
  })
})
