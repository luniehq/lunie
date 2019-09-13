import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpSeed from "common/TmSessionSignUpSeed"

describe(`TmSessionSignUpSeed`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper, $store

  beforeEach(() => {
    $store = {
      state: {
        session: { insecureMode: true },
        signup: {
          signUpSeed: "seed",
          signUpWarning: false
        }
      },
      commit: jest.fn(),
      dispatch: jest.fn().mockResolvedValue("")
    }

    wrapper = shallowMount(TmSessionSignUpSeed, {
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
    expect(wrapper.vm.fieldSeed).not.toBe(``)
    expect(wrapper.element).toMatchSnapshot()
  })
})
