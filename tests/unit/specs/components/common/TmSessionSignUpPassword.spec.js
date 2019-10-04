import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpPassword from "common/TmSessionSignUpPassword"
import TmBtn from "common/TmBtn"

describe(`TmSessionSignUpPassword`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          fieldPassword: ``,
          fieldPasswordConfirm: ``
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn()
      }
    }

    wrapper = shallowMount(TmSessionSignUpPassword, {
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

  it("renders", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should commit updateField on password field change`, () => {
    wrapper.setData({ fieldPassword: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpPassword`,
      value: `1234567890`
    })
  })

  it(`should commit updateField on password confirm field change`, () => {
    wrapper.setData({ fieldPasswordConfirm: `1234567890` })
    expect($store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpPasswordConfirm`,
      value: `1234567890`
    })
  })

  it(`should go to /create/confirm when submit the form`, () => {
    wrapper.vm.$store.state.signup.fieldPassword = `1234567890`
    wrapper.vm.$store.state.signup.fieldPasswordConfirm = `1234567890`
    wrapper.vm.submit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/create/confirm`)
  })
})
