import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import TmSessionSignUpSuccess from "common/TmSessionSignUpSuccess"

describe(`TmSessionSignUpSuccess`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(TmSessionSignUpSuccess, {
      localVue,
      stubs: [`router-link`]
    })
  })

  it("renders", () => {
    expect(wrapper.element).toMatchSnapshot()
  })
})
