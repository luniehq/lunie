import { shallowMount } from "@vue/test-utils"
import MaintenanceBar from "common/MaintenanceBar"

describe(`MaintenanceBar`, () => {
  let wrapper
  beforeEach(async () => {
    wrapper = shallowMount(MaintenanceBar)
  })

  it(`has the expected html structure`, () => {
    expect(wrapper.element).toMatchSnapshot()
  })

  it(`show success message`, () => {
    wrapper.setData({
      maintenance: [
        {
          message: "success test message",
          type: "success",
          show: true
        }
      ]
    })
    expect(wrapper.find(".maintenance-bar.success p").text()).toBe(
      "success test message"
    )
  })

  it(`show warning message`, () => {
    wrapper.setData({
      maintenance: [
        {
          message: "warning test message",
          type: "warning",
          show: true
        }
      ]
    })
    expect(wrapper.find(".maintenance-bar.warning p").text()).toBe(
      "warning test message"
    )
  })

  it(`show danger message`, () => {
    wrapper.setData({
      maintenance: [
        {
          message: "danger test message",
          type: "danger",
          show: true
        }
      ]
    })
    expect(wrapper.find(".maintenance-bar.danger p").text()).toBe(
      "danger test message"
    )
  })

  it(`close message button works`, () => {
    wrapper.setData({
      maintenance: [
        {
          message: "success test message",
          type: "success",
          show: true
        }
      ]
    })
    wrapper.vm.close(wrapper.vm.maintenance[0])
    expect(wrapper.find(".maintenance-bar.success p").exists()).toBe(false)
  })
})
