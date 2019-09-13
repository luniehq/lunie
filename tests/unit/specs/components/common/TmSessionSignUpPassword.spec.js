import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpPassword from "common/TmSessionSignUpPassword"

describe(`TmSessionSignUpPassword`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpPassword: "",
          signUpPasswordConfirm: ""
        }
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
})
