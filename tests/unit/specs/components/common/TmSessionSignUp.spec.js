import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUp from "common/TmSessionSignUp"

describe(`TmSessionSignUp`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpName: ""
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn()
      }
    }

    wrapper = shallowMount(TmSessionSignUp, {
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

  it(`should commit updateField on field change`, async () => {
    wrapper.setData({ fieldName: `HappyLunieUser` })
    expect(wrapper.vm.$store.commit).toHaveBeenCalledWith(`updateField`, {
      field: `signUpName`,
      value: `HappyLunieUser`
    })
  })

  it(`should go to /create/password when submit the form`, async () => {
    wrapper.vm.$store.state.signup.signUpName = `HappyLunieUser`
    await wrapper.vm.onSubmit()
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/create/password`)
  })
})
