import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImport from "session/TmSessionImport"
import {
  isPolkadotHexSeed,
  polkadotRawSeedValidate,
  polkadotValidation,
} from "session/TmSessionImport"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImport`, () => {
  let wrapper, $store, getters

  beforeEach(() => {
    getters = {
      connected: () => true,
      currentNetwork: {
        id: "kusama",
        network_type: "polkadot",
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
      dispatch: jest.fn(async () => true),
      mutations: {
        updateField: jest.fn(),
      },
    }
    wrapper = shallowMount(TmSessionImport, {
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

  it(`validation should fail if seed is not filled in`, async () => {
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.seed.$error).toBe(true)
  })

  it(`validation should fail if seed is not 12 or 24 words long`, async () => {
    wrapper = shallowMount(TmSessionImport, {
      localVue,
      mocks: {
        $store: {
          state: {
            recover: { seed: `` },
          },
          getters: {
            network: "cosmos-hub-mainnet",
            currentNetwork: {
              id: "cosmos-hub-mainnet",
              network_type: "cosmos",
            },
          },
        },
        $router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
    })
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.seed.$error).toBe(true)
  })

  it(`should validate if seed is 12 or 24 words long`, async () => {
    wrapper = shallowMount(TmSessionImport, {
      localVue,
      mocks: {
        $store: {
          state: {
            recover: { seed: `` },
          },
          getters: {
            network: "cosmos-hub-mainnet",
            currentNetwork: {
              id: "cosmos-hub-mainnet",
              network_type: "cosmos",
            },
          },
        },
        $router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
    })
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.seed.$error).toBe(false)
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.seed.$error).toBe(false)
  })

  it(`should commit updateField on field change`, async () => {
    wrapper.setData({ seed: `asdf asdf asdf asdf` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `seed`,
      value: `asdf asdf asdf asdf`,
    })
  })

  it(`should go to /recover/name when submit the form`, async () => {
    wrapper = shallowMount(TmSessionImport, {
      localVue,
      mocks: {
        $store: {
          state: {
            recover: { seed: `` },
          },
          getters: {
            network: "cosmos-hub-mainnet",
            currentNetwork: {
              id: "cosmos-hub-mainnet",
              network_type: "cosmos",
            },
          },
        },
        $router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
    })
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/recover/name`)
  })

  it(`should validate if a seed is a Kusama hex seed`, () => {
    let seed =
      "0x3ddaf335b6df385e5cfc6b78c9ce112afd8ac38f6794d29af3ee5f808dfae348"
    expect(isPolkadotHexSeed(seed)).toBe(true)
    seed = "ddaf335b6df385e5cfc6b78c9ce112afd8ac38f6794d29af3ee5f808dfae348123"
    expect(isPolkadotHexSeed(seed)).toBe(false)
  })

  it(`should validate if a seed is a Kusama raw seed`, () => {
    let seed = "0xd551233cd15fdb8b0dca468d38ac"
    expect(polkadotRawSeedValidate(seed)).toBe(true)
    seed = "d551233cd15fdb8b0dca468d38ac"
    expect(polkadotRawSeedValidate(seed)).toBe(true) // weird?? But it is on PolkadotUI ¯\_(ツ)_/¯
  })

  it(`should validate if a seed is a Kusama correct seed`, () => {
    let seed =
      "frame uphold talent kiwi chapter horn hen margin essay power frozen wisdom"
    expect(polkadotValidation(seed)).toBe(true)
    seed =
      "frame uphold talent kiwi chapter horn hen margin essay power frozen wisdo"
    expect(polkadotValidation(seed)).toBe(false)
  })
})
