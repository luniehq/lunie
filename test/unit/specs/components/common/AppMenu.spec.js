import { shallowMount } from "@vue/test-utils"
import AppMenu from "common/AppMenu"

describe(`AppMenu`, () => {
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

    wrapper = shallowMount(AppMenu, {
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

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() } }
    AppMenu.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })
})
