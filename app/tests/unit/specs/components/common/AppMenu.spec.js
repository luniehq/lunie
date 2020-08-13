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
})
