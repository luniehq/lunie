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

  it(`should close`, () => {
    const self = {
      $emit: jest.fn()
    }
    SessionBackupCodes.methods.close.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it("moves to other session pages", () => {
    const self = {
      $emit: jest.fn()
    }
    SessionBackupCodes.methods.setState.call(self, "welcome")
    expect(self.$emit).toHaveBeenCalledWith("route-change", "welcome")
  })
})
