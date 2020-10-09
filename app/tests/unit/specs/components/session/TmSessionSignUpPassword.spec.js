import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpPassword from "session/TmSessionSignUpPassword"

describe(`TmSessionSignUpPassword`, () => {
  const localVue = createLocalVue()

  localVue.directive(`focus`, () => {})
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpPassword: ``,
          signUpPasswordConfirm: ``,
        },
      },
      commit: jest.fn(),
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn(),
      },
    }

    wrapper = shallowMount(TmSessionSignUpPassword, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn(),
        },
      },
      stubs: [`router-link`],
      sync: false,
    })
  })

  it("renders", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should commit updateField on password field change`, () => {
    wrapper.setData({ fieldPassword: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpPassword`,
      value: `1234567890`,
    })
  })

  it(`should commit updateField on password confirm field change`, () => {
    wrapper.setData({ fieldPasswordConfirm: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpPasswordConfirm`,
      value: `1234567890`,
    })
  })

  it(`should go to /create/confirm when submit the form`, async () => {
    wrapper.vm.$store.state.signup.signUpPassword = `1234567890`
    wrapper.vm.$store.state.signup.signUpPasswordConfirm = `1234567890`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/create/confirm`)
  })
})
