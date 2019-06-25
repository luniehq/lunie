import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SessionApprove from "common/SessionApprove"

describe(`SessionApprove`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)

  let wrapper

  beforeEach(() => {
    wrapper = shallowMount(SessionApprove, {
      localVue
    })
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it(`should close`, () => {
    const self = {
      $emit: jest.fn()
    }
    SessionApprove.methods.close.call(self)
    expect(self.$emit).toHaveBeenCalledWith(`close`)
  })

  it("moves to other session pages", () => {
    const self = {
      $emit: jest.fn()
    }
    SessionApprove.methods.setState.call(self, "welcome")
    expect(self.$emit).toHaveBeenCalledWith("route-change", "welcome")
  })
})
