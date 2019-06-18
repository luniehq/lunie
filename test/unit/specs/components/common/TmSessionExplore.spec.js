import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionExplore from "common/TmSessionExplore"

describe(`TmSessionExplore`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => true),
      getters: {
        connected: true
      }
    }

    wrapper = shallowMount(TmSessionExplore, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn()
        },
        $store
      }
    })
  })

  it(`shows a form to sign in with an address`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`
    })
    await wrapper.vm.onSubmit()
    expect($store.commit).toHaveBeenCalledWith(`toggleSessionModal`, false)
  })

  it(`should set the current view to the state`, () => {
    wrapper.vm.setState(`someState`)
    expect($store.commit).toHaveBeenCalledWith(
      `setSessionModalView`,
      `someState`
    )
  })

  it(`should go back to existing session component`, () => {
    wrapper.vm.goBack()
    expect($store.commit).toHaveBeenCalledWith(
      `setSessionModalView`,
      `existing`
    )
  })

  it(`should signal signedin state on successful login`, async () => {
    wrapper.setData({
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`
    })
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`,
      sessionType: `explore`
    })
  })

  it(`should show error if address is not in bech32`, () => {
    wrapper.setData({ address: `cosmos2xxxxx` })
    wrapper.vm.onSubmit()
    expect($store.commit.mock.calls[1]).toBeUndefined()
    expect(wrapper.find(`.tm-form-msg-error`)).toBeDefined()
  })

  it(`should show the last account used`, () => {
    localStorage.setItem(`prevAddress`, `cosmos1xxx`)

    const self = {
      address: ``
    }
    TmSessionExplore.mounted.call(self)

    expect(self.address).toBe(`cosmos1xxx`)
  })
})
