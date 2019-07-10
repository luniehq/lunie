import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SessionBackupCodes from "common/SessionBackupCodes"

describe(`SessionBackupCodes`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SessionBackupCodes, {
      localVue,
      propsData: { address: `cosmos1ek9cd8ewgxg9w5x3benji0uf4aaxaruvcw4v9e` }
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })
})
