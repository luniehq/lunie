import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SessionAccounts from "common/SessionAccounts"

describe(`SessionAccounts`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SessionAccounts, {
      localVue,
      stubs: [`router-link`]
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
