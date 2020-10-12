import { shallowMount, createLocalVue } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionExplore from "session/TmSessionExplore"

describe(`TmSessionExplore`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store
  const networks = [
    {
      id: "cosmos-hub-testnet",
      address_prefix: "cosmos",
      testnet: true,
    },
    {
      id: "cosmos-hub-mainnet",
      address_prefix: "cosmos",
      testnet: false,
      slug: "cosmos-hub",
    },
    {
      id: "terra-testnet",
      address_prefix: "terra",
      testnet: true,
    },
    {
      id: "kusama",
      address_prefix: "",
      testnet: false,
      type: "polkadot",
    },
  ]
  const addresses = [
    {
      address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
      type: `explore`,
    },
    {
      address: `cosmos1unc788q8md2jymsns24eyhua58palg5kc7cstv`,
      type: `ledger`,
    },
    {
      address: `cosmos1vxkye0mpdtjhzrc6va5lcnxnuaa7m64khj8klc`,
      type: `extension`,
    },
    {
      address: `cosmos1epsszxwps8ayeusfh8ru995atagc05sslwesuy`,
      type: `local`,
    },
  ]

  beforeEach(() => {
    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(() => true),
      getters: {
        network: "cosmos-hub-testnet",
        networks,
      },
      state: {
        session: {
          address: ``,
          addresses,
        },
      },
    }

    wrapper = shallowMount(TmSessionExplore, {
      localVue,
      mocks: {
        $router: {
          push: jest.fn(),
        },
        $store,
      },
    })
  })

  it(`shows a form to sign in with an address`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should close the modal on successful login`, async () => {
    wrapper.setData({
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`,
    })
    wrapper.vm.$emit = jest.fn()
    $store.dispatch = () =>
      Promise.resolve({
        slug: "cosmos-hub",
      })
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: "portfolio",
      params: { networkId: "cosmos-hub" },
    })
  })

  it(`should dispatch getNetworkByAccount on submit`, async () => {
    wrapper.setData({
      address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`,
    })
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`getNetworkByAccount`, {
      account: {
        address: `cosmos1thyn8gfapk2d0zsp6dysn99ynhcs2y759kwznx`,
      },
      testnet: true,
    })
  })

  it(`should show the last account used`, () => {
    localStorage.setItem(`prevAddress`, `cosmos1xxx`)
    wrapper = shallowMount(TmSessionExplore, {
      localVue,
      mocks: {
        $store,
      },
    })
    expect(wrapper.vm.address).toBe(`cosmos1xxx`)
  })

  it(`should explore with a previously used address`, async () => {
    let address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
    await wrapper.vm.exploreWith(address)
    expect($store.dispatch).toHaveBeenCalledWith(`getNetworkByAccount`, {
      account: {
        address: `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`,
      },
      testnet: true,
    })
  })

  it(`should set an error message if the address isn't recognised by Lunie`, async () => {
    let address = `cosmos1z8mzakma7vnaajysmtkwt4wgjqr2m84tzvyfkz`
    $store.dispatch = () => Promise.reject(new Error("Not recognised address"))
    await wrapper.vm.addressValidate(address)
    expect(wrapper.vm.addressError).toBe("Not recognised address")
  })

  it(`should check testnet checkbox if current network is a testnet`, async () => {
    expect(wrapper.vm.testnet).toBe(true)
  })
})
