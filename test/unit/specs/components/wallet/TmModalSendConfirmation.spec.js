import { mount } from "@vue/test-utils"
import TmModalSendConfirmation from "renderer/components/wallet/TmModalSendConfirmation"

describe("TmModalSendConfirmation", () => {
  let wrapper
  let propsData = {
    amount: 12345,
    denom: "funkycoin",
    recipient: "cosmosacc1tb1d4u5zerywfjhxuc9nudvw"
  }

  beforeEach(() => {
    wrapper = mount(TmModalSendConfirmation, { propsData })
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("shows the data", () => {
    expect(wrapper.vm.$el.outerHTML).toContain(propsData.amount)
    expect(wrapper.vm.$el.outerHTML).toContain(propsData.denom)
    expect(wrapper.vm.$el.outerHTML).toContain(propsData.recipient)
  })

  it("emits an approval event", () => {
    let spy = jest.spyOn(wrapper.vm, "$emit")
    wrapper.vm.$el.querySelector("#send-confirmation-btn").click()
    expect(spy).toHaveBeenCalledWith("approved")
  })

  it("emits an canceled event", () => {
    let spy = jest.spyOn(wrapper.vm, "$emit")
    wrapper.vm.$el.querySelector("#send-cancel-btn").click()
    expect(spy).toHaveBeenCalledWith("canceled")
  })
})
