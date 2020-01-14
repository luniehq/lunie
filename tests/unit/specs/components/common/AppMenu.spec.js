import { shallowMount, createLocalVue } from "@vue/test-utils"
import AppMenu from "common/AppMenu"

const localVue = createLocalVue()
localVue.directive(`tooltip`, () => {})

describe(`AppMenu`, () => {
  let $store

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      state: {
        session: {
          signedIn: true
        }
      },
      getters: {
        address: `cosmos1`
      }
    }

    shallowMount(AppMenu, {
      localVue,
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`opens the session modal for a sign in`, () => {
    const $store = { commit: jest.fn(), $emit: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    AppMenu.methods.signIn.call(self)
    expect(self.$router.push).toHaveBeenCalledWith(`/welcome`)
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = {
      network: `la-red-feliz`,
      $store,
      $router: { push: jest.fn() },
      $emit: jest.fn()
    }
    AppMenu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`, `la-red-feliz`)
  })

  it(`closes menu on sign out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    AppMenu.methods.signOut.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it(`should close menu and reset scroll on click`, () => {
    global.window = Object.create(window)
    Object.defineProperty(window, `scrollTo`, {
      value: jest.fn()
    })
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    AppMenu.methods.handleClick.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it(`shows a warning if showing address on Ledger fails`, async () => {
    const self = {
      $store: {
        dispatch: jest.fn(() => Promise.reject(new Error("Expected Error")))
      }
    }
    await AppMenu.methods.showAddressOnLedger.call(self)
    expect(self.$store.dispatch).toHaveBeenCalledWith("showAddressOnLedger")
    expect(self.ledgerAddressError).toBe("Expected Error")
  })

  it(`clears the warning if showing address on Ledger fails after a while`, async () => {
    jest.useFakeTimers()
    const self = {
      $store: {
        dispatch: jest.fn(() => Promise.reject(new Error("Expected Error")))
      }
    }
    await AppMenu.methods.showAddressOnLedger.call(self)

    jest.runAllTimers()
    expect(self.ledgerAddressError).toBe(undefined)

    jest.useRealTimers()
  })
})
