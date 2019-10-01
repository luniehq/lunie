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
      state: {
        session: {
          address: ``,
          addresses: [
            {
              address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
              type: `explore`
            },
            {
              address: `cosmos1unc788q8md2jymsns24eyhua58palg5kc7cstv`,
              type: `ledger`
            },
            {
              address: `cosmos1vxkye0mpdtjhzrc6va5lcnxnuaa7m64khj8klc`,
              type: `extension`
            }
          ]
        }
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
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`
    })
    wrapper.vm.$emit = jest.fn()
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
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

  it(`should show error if address is a validator address`, () => {
    wrapper.setData({
      address: `cosmosvaloper12knqu4ecmg0982plzs9m9f5jareh0cvegcw3wu`
    })
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

  it(`should explore with a previously used address`, async () => {
    console.log(wrapper.html())
    let address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
    await wrapper.vm.exploreWith(address)
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
      sessionType: `explore`
    })
  })
})
