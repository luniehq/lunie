import { shallowMount, createLocalVue } from "@vue/test-utils"
import ToolBar from "common/ToolBar"

describe(`ToolBar`, () => {
  const localVue = createLocalVue()
  localVue.directive(`tooltip`, () => {})

  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      state: {
        session: {
          signedIn: true
        }
      }
    }

    wrapper = shallowMount(ToolBar, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`call dispatch to sign the user out`, () => {
    const $store = { dispatch: jest.fn() }
    const self = { $store, $router: { push: jest.fn() } }
    ToolBar.methods.signOut.call(self)
    expect($store.dispatch).toHaveBeenCalledWith(`signOut`)
  })

  it(`opens session modal`, () => {
    const $store = { commit: jest.fn() }
    const self = { $store, $router: { push: jest.fn() } }
    ToolBar.methods.signIn.call(self)
    expect(self.$router.push).toHaveBeenCalledWith(`/welcome`)
  })
})
