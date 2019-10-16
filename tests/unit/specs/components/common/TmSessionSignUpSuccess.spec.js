import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpSuccess from "common/TmSessionSignUpSuccess"

describe(`TmSessionSignUpSuccess`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpName: ``,
          signUpSeed: `Creating seed...`,
          signUpPassword: ``,
          signUpPasswordConfirm: ``,
          signUpWarning: false
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn(),
      mutations: {
        updateField: jest.fn()
      }
    }

    wrapper = shallowMount(TmSessionSignUpSuccess, {
      localVue,
      mocks: {
        $store,
        $router: {
          push: jest.fn()
        }
      },
      stubs: [`router-link`],
      sync: false
    })
  })

  it("renders", () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`should dispatch resetSignUpData`, async () => {
    expect($store.dispatch).toHaveBeenCalledWith(`resetSignUpData`)
  })
})
