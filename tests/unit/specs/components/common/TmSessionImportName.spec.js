import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportName from "common/TmSessionImportName"
import TmBtn from "common/TmBtn"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImportName`, () => {
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
      dispatch: jest.fn(async () => true),
      mutations: {
        updateField: jest.fn()
      }
    }
    wrapper = shallowMount(TmSessionImportName, {
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

  it(`should disable button if name is not filled in`, async () => {
    expect(wrapper.find(TmBtn).attributes(`disabled`)).toBe("true")
  })

  it(`should disable button if name lenght < 5 characters`, async () => {
    $store.state.recover.name = `asdf`
    wrapper = shallowMount(TmSessionImportName, {
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

  it(`should enable button if name lenght >= 5 characters`, async () => {
    $store.state.recover.name = `Happy Lunie User`
    wrapper = shallowMount(TmSessionImportName, {
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

  it(`should commit updateField on field change`, async () => {
    wrapper.setData({ name: `Happy Lunie User` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `name`,
      value: `Happy Lunie User`
    })
  })
})
