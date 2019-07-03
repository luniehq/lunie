import { createLocalVue, shallowMount } from "@vue/test-utils"
import Vuelidate from "vuelidate"
import SessionApprove from "common/SessionApprove"

describe(`SessionApprove`, () => {
  const localVue = createLocalVue()
  localVue.use(Vuelidate)
  localVue.directive("focus", () => { })

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
        $store,
        $router: {
          push: jest.fn()
        }
      }
    })
  })

  it(`shows the approval modal with the transaction and an invoice table`, () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  describe("approve", () => {
    it("fails if no password", async () => {
      wrapper.vm.close = jest.fn()
      wrapper.vm.password = ""
      wrapper.find("#approve-btn").trigger("click")
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$store.dispatch).not.toHaveBeenCalled()
      expect(wrapper.vm.close).not.toHaveBeenCalled()
    })

    it("approves and closes", async () => {
      wrapper.vm.close = jest.fn()
      wrapper.vm.password = "1234"
      wrapper.find("#approve-btn").trigger("click")
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
        "approveSignRequest",
        { password: "1234", senderAddress: "cosmos1234", signMessage: "{}" }
      )
      expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`approved`)
    })
  })

  it("rejects", async () => {
    wrapper.vm.close = jest.fn()
    wrapper.find("#reject-btn").trigger("click")
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith(
      "rejectSignRequest",
      { senderAddress: "cosmos1234", signMessage: "{}" }
    )
    expect(wrapper.vm.$router.push).toHaveBeenCalledWith(`/`)
  })
})
