import { shallowMount } from "@vue/test-utils"
import AppMenu from "common/AppMenu"

describe(`AppMenu`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      state: {
        session: {
          signedIn: true
        }
      }
    }

    wrapper = shallowMount(AppMenu, {
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
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    AppMenu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`closes menu on sign out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    AppMenu.methods.signOut.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })
})
