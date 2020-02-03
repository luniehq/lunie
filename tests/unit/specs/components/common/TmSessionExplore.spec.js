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
        network: "cosmos-hub-testnet"
      },
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
            },
            {
              address: `cosmos1vxkye0mpdtjhzrc6va5lcnxnuaa7m64khj8xyz`,
              type: `local`
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

    wrapper.setData({
      addressPrefixes: [
        {
          id: "cosmos-hub-testnet",
          address_prefix: "cosmos",
          testnet: false
        }
      ]
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

  it(`should show error if address is a "cosmospub" address`, () => {
    wrapper.setData({
      address: `cosmospub1addwnpepqgadvwk7ev0kk2x0tua0hrt056p8tqpv35r0mwydz45ytxp3wfaz5e7nxun`
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
    let address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
    await wrapper.vm.exploreWith(address)
    expect($store.dispatch).toHaveBeenCalledWith(`signIn`, {
      address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
      sessionType: `explore`
    })
  })

  it(`returns "true" if receives a correct Ethereum address all in small caps`, () => {
    const ethereumAddress = `0x010afb8548a5d1a3a3d62f58ca0a5a1329974206`
    const check = TmSessionExplore.methods.isEthereumAddress(ethereumAddress)
    expect(check).toBe(true)
  })

  it(`returns "true" if receives a correct Ethereum address all in big caps`, () => {
    const ethereumAddress = `0x010AFB8548A5D1A3A3D62F58CA0A5A1329974206`
    const check = TmSessionExplore.methods.isEthereumAddress(ethereumAddress)
    expect(check).toBe(true)
  })

  it(`returns "false" if receives an incorrect Ethereum address`, () => {
    const ethereumAddress = `0x010AFB8548A5D1A3A3D62F58`
    const check = TmSessionExplore.methods.isEthereumAddress(ethereumAddress)
    expect(check).toBe(false)
  })

  it(`returns "true" if receives a checksummed Ethereum address`, () => {
    const ethereumAddress = `0x28f4961F8b06F7361A1efD5E700DE717b1db5292`
    const check = TmSessionExplore.methods.isEthereumAddress(ethereumAddress)
    expect(check).toBe(true)
  })
})
