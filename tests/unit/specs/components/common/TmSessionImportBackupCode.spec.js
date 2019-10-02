import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportBackupCode from "common/TmSessionImportBackupCode"
import TmBtn from "common/TmBtn"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImportBackupCode`, () => {
  let wrapper, $store, getters

  beforeEach(() => {
    getters = {
      connected: () => true
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
      dispatch: jest.fn(async () => true)
    }
    wrapper = shallowMount(TmSessionImportBackupCode, {
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
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should disable button if seed is not filled in`, async () => {
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe("true")
  })

  it(`should disable button if seed is not 24 words long`, async () => {
    $store.state.recover.seed = `asdf asdf asdf asdf`
    getters = {
      seed: () => `asdf asdf asdf asdf`
    }
    wrapper = shallowMount(TmSessionImportBackupCode, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    // console.log(wrapper.html())
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe("true")
  })

  it(`should enable button if seed is 24 words long`, async () => {
    $store.state.recover.seed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    getters = {
      seed: () =>
        `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    }
    wrapper = shallowMount(TmSessionImportBackupCode, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`]
    })
    // console.log(wrapper.html())
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe(undefined)
  })
})
