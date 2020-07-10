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
          signedIn: true,
        },
        connection: {
          networkSlug: "lunie-net",
        },
      },
      getters: {
        address: `cosmos1`,
      },
    }

    shallowMount(AppMenu, {
      localVue,
      mocks: {
        $store,
      },
      stubs: [`router-link`],
    })
  })

  it(`goes to portfolio page to see sign in options`, () => {
    const $store = {
      commit: jest.fn(),
      $emit: jest.fn(),
    }
    const self = {
      networkSlug: `lunie-net`,
      $store,
      $router: { push: jest.fn() },
      $emit: jest.fn(),
      $route: { name: `not-portfolio` },
    }
    AppMenu.methods.signIn.call(self)
    expect(self.$router.push).toHaveBeenCalledWith({
      name: `portfolio`,
      params: { networkId: `lunie-net` },
    })
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = {
      address: `cosmos1`,
      network: `la-red-feliz`,
      $store,
      $router: { push: jest.fn() },
      $emit: jest.fn(),
    }
    AppMenu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`, {
      address: `cosmos1`,
      networkId: `la-red-feliz`,
    })
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
      value: jest.fn(),
    })
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    AppMenu.methods.handleClick.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it(`shows a warning if showing address on Ledger fails`, async () => {
    const self = {
      showAddressOnLedgerFn: jest.fn(() =>
        Promise.reject(new Error("Expected Error"))
      ),
    }
    await AppMenu.methods.showAddressOnLedger.call(self)
    expect(self.showAddressOnLedgerFn).toHaveBeenCalled()
    expect(self.ledgerAddressError).toBe("Expected Error")
  })

  it(`clears the warning if showing address on Ledger fails after a while`, async () => {
    jest.useFakeTimers()
    const self = {
      showAddressOnLedgerFn: jest.fn(() =>
        Promise.reject(new Error("Expected Error"))
      ),
    }
    await AppMenu.methods.showAddressOnLedger.call(self)

    jest.runAllTimers()
    expect(self.ledgerAddressError).toBe(undefined)

    jest.useRealTimers()
  })

  it(`clears the warning timeout if user intents to show address on Ledger again`, async () => {
    jest.useFakeTimers()
    const self = {
      showAddressOnLedgerFn: jest.fn(() =>
        Promise.reject(new Error("Expected Error"))
      ),
    }
    await AppMenu.methods.showAddressOnLedger.call(self)
    expect(self.messageTimeout).toBeDefined()
    AppMenu.methods.showAddressOnLedger.call(self)
    expect(self.messageTimeout).toBeUndefined()

    jest.useRealTimers()
  })
})
