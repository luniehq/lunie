import { shallowMount } from "@vue/test-utils"
import SessionRouter from "common/SessionRouter"

describe(`SessionRouter`, () => {
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
    wrapper = shallowMount(SessionRouter, {
      mocks: {
        $store
      }
    })
  })

  it(`should show by default`, () => {
    expect(wrapper.isEmpty()).toBe(false)
  })

  it(`should show a welcome screen if selected`, () => {
    wrapper.setData({ view: `welcome` })
    expect(wrapper.contains(`session-welcome-stub`)).toBe(true)
  })

  it(`should show a signup screen if selected`, () => {
    wrapper.setData({ view: `sign-up` })
    expect(wrapper.contains(`session-sign-up-stub`)).toBe(true)
  })

  it(`should show a signin screen if selected`, () => {
    wrapper.setData({ view: `sign-in` })
    expect(wrapper.contains(`session-sign-in-stub`)).toBe(true)
  })

  it(`should show a hardware signin screen if selected`, () => {
    wrapper.setData({ view: `hardware` })
    expect(wrapper.contains(`session-hardware-stub`)).toBe(true)
  })

  it(`should show a import screen if selected`, () => {
    wrapper.setData({ view: `import` })
    expect(wrapper.contains(`session-import-stub`)).toBe(true)
  })

  it(`should show a import screen if selected`, () => {
    wrapper.setData({ view: `account-delete` })
    expect(wrapper.contains(`session-account-delete-stub`)).toBe(true)
  })

  it(`should close the session modal`, () => {
    const self = {
      $emit: jest.fn()
    }
    SessionRouter.methods.close.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it(`should set the view`, () => {
    const self = {
      view: "none"
    }
    SessionRouter.methods.goTo.call(self, "welcome")
    expect(self.view).toBe(`welcome`)
  })
})
