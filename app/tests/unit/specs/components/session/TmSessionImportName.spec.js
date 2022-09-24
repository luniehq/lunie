import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportName from "session/TmSessionImportName"
jest.mock(`scripts/google-analytics.js`, () => () => {})
jest.mock("@lunie/cosmos-keys", () => ({
  getWalletIndex: function () {
    return [{ name: `Happy Lunie User`, address: `xyz123` }]
  },
  getNewWalletFromSeed: function () {
    return { cosmosAddress: `cosmos1234` }
  },
}))
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImportName`, () => {
  let wrapper, $store, getters

  beforeEach(() => {
    getters = {
      connected: () => true,
      network: "cosmos-hub-mainnet",
      currentNetwork: {
        id: "cosmos-hub-mainnet",
        network_type: "cosmos",
        address_prefix: "cosmos",
        testnet: false,
        HDPaths: `[{"value":"m/44'/118'/0'/0/0", "name":"Cosmos HD Path"}]`,
        curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
      },
    }
    $store = {
      state: {
        recover: {
          name: ``,
          seed: ``,
          password: ``,
          passwordConfirm: ``,
          warning: false,
        },
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => `cosmos1234`),
      mutations: {
        updateField: jest.fn(),
      },
    }
    wrapper = shallowMount(TmSessionImportName, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`validation should fail if name is not filled in`, async () => {
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.name.$error).toBe(true)
  })

  it(`validation should fail if name lenght < 3 characters`, async () => {
    wrapper.vm.$store.state.recover.name = `as`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.name.$error).toBe(true)
  })

  it(`validation should not fail if name lenght >= 3 characters`, async () => {
    wrapper.vm.$store.state.recover.name = `Happy Lunie User 2`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.name.$error).toBe(false)
  })

  it(`validation should fail if name exists already in stored accounts`, async () => {
    wrapper.vm.$store.state.recover.name = `Happy Lunie User`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.name.$error).toBe(true)
  })

  it(`should commit updateField on field change`, async () => {
    wrapper.setData({ name: `Happy Lunie User` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `name`,
      value: `Happy Lunie User`,
    })
  })

  it(`should go to /recover/password when submit the form`, async () => {
    wrapper.vm.$store.state.recover.name = `Happy Lunie User 2`
    wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/recover/password`)
  })

  // case cosmos
  it(`should return the HDPaths from a network parsed as JSON`, () => {
    expect(wrapper.vm.networkCryptoTypes).toEqual([
      { value: "m/44'/118'/0'/0/0", name: "Cosmos HD Path" },
    ])
  })

  // case polkadot
  it(`should return the curves from a network parsed as JSON`, () => {
    wrapper.setData({
      currentNetwork: {
        id: "polkadot-testnet",
        network_type: "polkadot",
        address_prefix: "42",
        testnet: false,
        HDPaths: `[""]`,
        curves: `[{"value":"ed25519", "name":"Edwards curve"}]`,
      },
    })
    expect(wrapper.vm.networkCryptoTypes).toEqual([
      { value: "ed25519", name: "Edwards curve" },
    ])
  })

  // case cosmos
  it(`should return the current HDPath we are creating the address from depending on the attempt number`, () => {
    wrapper.setData({
      attempt: 0,
    })
    const curve = wrapper.vm.currentHDPathOrCurve()["HDPath"]
    expect(curve).toEqual("m/44'/118'/0'/0/0")
  })

  // case polkadot
  it(`should return the current curve we are creating the address from depending on the attempt number`, () => {
    wrapper.setData({
      currentNetwork: {
        id: "polkadot-testnet",
        network_type: "polkadot",
        address_prefix: "42",
        testnet: false,
        HDPaths: `[""]`,
        curves: `[{"value":"sr25519", "name":"Schnorrkel curve"},{"value":"ed25519", "name":"Edwards curve"},{"value":"ecdsa", "name":"ECDSA"}]`,
      },
      attempt: 1,
    })
    const curve = wrapper.vm.currentHDPathOrCurve()["curve"]
    expect(curve).toEqual("ed25519")
  })

  // case cosmos
  it(`should return a beautiful presentation for the curve to be displayed on modal`, () => {
    expect(wrapper.vm.currentCryptoView).toEqual("Cosmos HD Path")
  })

  // case polkadot
  it(`should return a beautiful presentation for the curve to be displayed on modal`, () => {
    wrapper.setData({
      currentNetwork: {
        id: "polkadot-testnet",
        network_type: "polkadot",
        address_prefix: "42",
        testnet: false,
        HDPaths: `[""]`,
        curves: `[{"value":"sr25519", "name":"Schnorrkel curve"},{"value":"ed25519", "name":"Edwards curve"}]`,
      },
      attempt: 1,
    })
    expect(wrapper.vm.currentCryptoView).toEqual("Edwards curve")
  })
})
