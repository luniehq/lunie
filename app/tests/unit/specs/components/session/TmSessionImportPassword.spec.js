import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportPassword from "session/TmSessionImportPassword"
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
      network: "lunie-net",
      networkSlug: "lunie",
      isExtension: false,
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
        session: {
          accountType: ``,
          accountTypeIndex: ``,
        },
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn(),
      },
    }
    wrapper = shallowMount(TmSessionImportPassword, {
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

  it(`validation should fail if passwords do not match`, async () => {
    wrapper.vm.$store.state.recover.password = `1234567890`
    wrapper.vm.$store.state.recover.passwordConfirm = `notthesame`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.passwordConfirm.$error).toBe(true)
    expect(wrapper.vm.$v.passwordConfirm.sameAsPassword).toBe(false)
  })

  it(`validation should not fail if passwords match`, async () => {
    wrapper.vm.$store.state.recover.password = `1234567890`
    wrapper.vm.$store.state.recover.passwordConfirm = `1234567890`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$v.passwordConfirm.$error).toBe(false)
    expect(wrapper.vm.$v.passwordConfirm.sameAsPassword).toBe(true)
  })

  it(`should commit updateField on password field change`, async () => {
    wrapper.setData({ password: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `password`,
      value: `1234567890`,
    })
  })

  it(`should commit updateField on passwordConfirm field change`, async () => {
    wrapper.setData({ passwordConfirm: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `passwordConfirm`,
      value: `1234567890`,
    })
  })

  it(`should dispatch createKey if passwords validate`, async () => {
    wrapper.vm.$store.state.recover.password = `1234567890`
    wrapper.vm.$store.state.recover.passwordConfirm = `1234567890`
    await wrapper.vm.onSubmit()
    expect($store.dispatch).toHaveBeenCalledWith(`createKey`, {
      name: ``,
      password: `1234567890`,
      network: "lunie-net",
      seedPhrase: ``,
      HDPath: undefined,
      curve: undefined,
    })
  })

  it(`should go to / when submit the form`, async () => {
    wrapper.vm.$store.state.recover.password = `1234567890`
    wrapper.vm.$store.state.recover.passwordConfirm = `1234567890`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
      name: "portfolio",
      params: { networkId: "lunie" },
    })
  })

  it(`should show error on createKey dispatch error`, async () => {
    wrapper.vm.$store.state.recover.password = `1234567890`
    wrapper.vm.$store.state.recover.passwordConfirm = `1234567890`
    wrapper.vm.$store.dispatch = {
      createKey: jest.fn().mockRejectedValue(new Error()),
    }
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.error).toBe(true)
  })

  it(`should dispatch resetRecoverData when the component is destroyed`, async () => {
    wrapper.destroy()
    expect($store.dispatch).toHaveBeenCalledWith(`resetRecoverData`)
  })
})
