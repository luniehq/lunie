import Vuex from "vuex"
import Vuelidate from "vuelidate"
import { shallowMount, createLocalVue } from "@vue/test-utils"
import TmSessionImportConfirmAddress from "common/TmSessionImportConfirmAddress"
// import TmBtn from "common/TmBtn"
jest.mock(`scripts/google-analytics.js`, () => () => {})
const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(Vuelidate)
localVue.directive(`tooltip`, () => {})
localVue.directive(`focus`, () => {})

describe(`TmSessionImportConfirmAddress`, () => {
  let wrapper, $store, getters

  beforeEach(() => {
    getters = {
      connected: () => true
    }
    $store = {
      state: {
        recover: {
          name: ``,
          seed: `two collect olive inside assault finger relief shallow lottery sugar universe fatigue knock current only absurd famous work path zone distance churn include flower`,
          password: ``,
          passwordConfirm: ``,
          warning: false
        }
      },
      getters,
      commit: jest.fn(),
      dispatch: jest.fn(async () => true)
    }
    wrapper = shallowMount(TmSessionImportConfirmAddress, {
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

  it(`has the expected html structure`, async () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should dispatch getAddressFromSeed`, async () => {
    expect($store.dispatch).toHaveBeenCalledWith(
      `getAddressFromSeed`,
      `two collect olive inside assault finger relief shallow lottery sugar universe fatigue knock current only absurd famous work path zone distance churn include flower`
    )
  })

  it(`should go to /recover/name when submit the form`, async () => {
    wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/recover/name`)
  })
})
