import { shallowMount } from "@vue/test-utils"
import DesktopMenu from "common/DesktopMenu"

describe(`DesktopMenu`, () => {
  let wrapper, $store

  beforeEach(async () => {
    $store = {
      commit: jest.fn(),
      getters: {
        session: {
          signedIn: true
        }
      }
    }

    wrapper = shallowMount(DesktopMenu, {
      mocks: {
        $store
      },
      stubs: [`router-link`]
    })
  })

  it(`has a perfect scrollbar`, () => {
    expect(wrapper.vm.ps).toBeDefined()
  })

  it(`can close the app menu`, () => {
    wrapper.find(`#app-menu__wallet`).trigger(`click`)
    expect(wrapper.emitted().close).toBeTruthy()
  })

  it(`opens the session modal for a sign in`, () => {
    const $store = { commit: jest.fn(), $emit: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    DesktopMenu.methods.signIn.call(self)
    expect(self.$router.push).toHaveBeenCalledWith(`/welcome`)
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    DesktopMenu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`closes menu on sign out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() }, $emit: jest.fn() }
    DesktopMenu.methods.signOut.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })
})
