import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImport from "common/TmSessionImport"
import TmBtn from "common/TmBtn"
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
    wrapper = shallowMount(TmSessionImport, {
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

  it(`validation should fail if seed is not filled in`, async () => {
    await wrapper.vm.submit()
    expect(wrapper.vm.$v.seed.$error).toBe(true)
  })

  it(`validation should fail if seed is not 24 words long`, async () => {
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf`
    await wrapper.vm.submit()
    expect(wrapper.vm.$v.seed.$error).toBe(true)
  })

  it(`should validate if seed is 24 words long`, async () => {
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    await wrapper.vm.submit()
    expect(wrapper.vm.$v.seed.$error).toBe(false)
  })

  it(`should commit updateField on field change`, async () => {
    wrapper.setData({ seed: `asdf asdf asdf asdf` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `seed`,
      value: `asdf asdf asdf asdf`
    })
  })

  it(`should go to /recover/confirm when submit the form`, async () => {
    wrapper.vm.$store.state.recover.seed = `asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf asdf`
    wrapper.vm.submit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/recover/confirm`)
  })
})
