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
          message: 'success test message',
          type: 'success',
          show: true
        }
      ]
    })
    expect(wrapper.toContain("success test message"))
  })

  it(`show warning message`, () => {
    wrapper.setData({
      maintenance: [
        {
          message: 'warning test message',
          type: 'warning',
          show: true
        }
      ]
    })
    expect(wrapper.toContain("warning test message"))
  })

  it(`show danger message`, () => {
    wrapper.setData({
      maintenance: [
        {
          message: 'danger test message',
          type: 'danger',
          show: true
        }
      ]
    })
    expect(wrapper.toContain("danger test message"))
  })
})
