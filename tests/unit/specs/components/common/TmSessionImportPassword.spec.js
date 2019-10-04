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
    getters = {}
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
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn()
      }
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

  it(`should commit updateField on password field change`, async () => {
    wrapper.setData({ password: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `password`,
      value: `1234567890`
    })
  })

  it(`should commit updateField on passwordConfirm field change`, async () => {
    wrapper.setData({ passwordConfirm: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `passwordConfirm`,
      value: `1234567890`
    })
  })

  it(`should dispatch createKey if passwords validate`, async () => {
    $store.state.recover.password = `1234567890`
    $store.state.recover.passwordConfirm = `1234567890`
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
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`createKey`, {
      name: ``,
      password: `1234567890`,
      seedPhrase: ``
    })
  })

  it(`should dispatch createKey if passwords validate`, async () => {
    $store.state.recover.password = `1234567890`
    $store.state.recover.passwordConfirm = `1234567890`
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
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`createKey`, {
      name: ``,
      password: `1234567890`,
      seedPhrase: ``
    })
  })

  /* TODO: Mock `createKey` dispatch error and expect `notifyError` commit */

  /*
  it(`should commit notifyError on createKey dispatch error`, async () => {
    $store.state.recover.password = `1234567890`
    $store.state.recover.passwordConfirm = `1234567890`

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
    // console.log(wrapper.vm.$v.$error)
    // console.log($store.dispatch)
    // console.log(wrapper.html())
    await wrapper.vm.onSubmit()
    //expect($store.commit).toHaveBeenCalledWith(`notifyError`)
  })
  */
})
