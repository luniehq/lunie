import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportName from "common/TmSessionImportName"
jest.mock(`scripts/google-analytics.js`, () => () => {})
jest.mock("@lunie/cosmos-keys", () => ({
  getWalletIndex: function() {
    return [{ name: `Happy Lunie User`, address: `xyz123` }]
  }
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
      network: "cosmos-hub-mainnet"
    }
    $store = {
      state: {
        recover: {
          name: ``,
          seed: ``,
          password: ``,
          passwordConfirm: ``,
          warning: false
        }
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => `cosmos1234`),
      mutations: {
        updateField: jest.fn()
      }
    }
    wrapper = shallowMount(TmSessionImportName, {
      localVue,
      mocks: {
        $store,
        $apollo: {
          queries: {
            addressPrefixes: { refetch: () => {} }
          }
        },
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    wrapper.setData({
      addressPrefixes: [
        {
          id: `cosmos-hub-mainnet`,
          address_prefix: `cosmos`
        },
        {
          id: `livepeer-mainnet`,
          address_prefix: `0x`
        },
        {
          id: `emoney-testnet`,
          address_prefix: `emoney`
        }
      ]
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
      value: `Happy Lunie User`
    })
  })

  it(`should go to /recover/password when submit the form`, async () => {
    wrapper.vm.$store.state.recover.name = `Happy Lunie User 2`
    wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/recover/password`)
  })
})
