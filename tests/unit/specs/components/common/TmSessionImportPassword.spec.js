import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportPassword from "common/TmSessionImportPassword"
// import TmBtn from "common/TmBtn"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImportPassword`, () => {
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
    wrapper = shallowMount(TmSessionImportPassword, {
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

  it(`validation should fail if passwords do not match`, async () => {
    $store.state.recover.password = `1234567890`
    $store.state.recover.passwordConfirm = `notthesame`
    getters = {
      password: () => `1234567890`,
      passwordConfirm: () => `notthesame`
    }
    wrapper = shallowMount(TmSessionImportPassword, {
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
    await wrapper.vm.onSubmit()
    // console.log(wrapper.vm.$v.passwordConfirm.$error) // Must be true
    // console.log(wrapper.vm.$v.passwordConfirm.sameAsPassword) // Must be false
    expect(wrapper.vm.$v.passwordConfirm.$error).toBe(true)
    expect(wrapper.vm.$v.passwordConfirm.sameAsPassword).toBe(false)
  })

  it(`validation should not fail if passwords match`, async () => {
    $store.state.recover.password = `1234567890`
    $store.state.recover.passwordConfirm = `1234567890`
    getters = {
      password: () => `1234567890`,
      passwordConfirm: () => `1234567890`
    }
    wrapper = shallowMount(TmSessionImportPassword, {
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
    await wrapper.vm.onSubmit()
    // console.log(wrapper.vm.$v.passwordConfirm.$error) // Must be false
    // console.log(wrapper.vm.$v.passwordConfirm.sameAsPassword) // Must be true
    expect(wrapper.vm.$v.passwordConfirm.$error).toBe(false)
    expect(wrapper.vm.$v.passwordConfirm.sameAsPassword).toBe(true)
  })
})
