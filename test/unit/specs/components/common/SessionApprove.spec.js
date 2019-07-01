import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SessionApprove from "common/SessionApprove"

describe(`SessionApprove`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => {})

  let wrapper, $store

  beforeEach(() => {
    const getters = {
      signRequest: {
        senderAddress: "cosmos1234",
        signMessage: "{}"
      }
    }

    $store = {
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters
    }
    wrapper = shallowMount(SessionApprove, {
      localVue,
      mocks: {
        $store
      }
    })
  })

  it(`shows the approval modal with the transaction and an invoice table`, () => {
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
