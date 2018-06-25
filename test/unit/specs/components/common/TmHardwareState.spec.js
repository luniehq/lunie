import { mount } from "@vue/test-utils"
import htmlBeautify from "html-beautify"
import TmHardwareState from "common/TmHardwareState"

describe("TmHardwareState", () => {
  let wrapper

  let propsData = {
    icon: "rotate_right",
    spin: true,
    value: "Detecting your Ledger Wallet"
  }

  beforeEach(() => {
    wrapper = mount(TmHardwareState, { propsData })
  })

  it("has an icon from props", () => {
    expect(wrapper.vm.icon).toBe("rotate_right")
  })

  it("has the expected html structure", () => {
    expect(htmlBeautify(wrapper.html())).toMatchSnapshot()
  })

  it("has a spinning icon", () => {
    expect(wrapper.contains("i.material-icons.fa-spin")).toBe(true)
  })

  it("has a label", () => {
    expect(
      wrapper
        .find(".tm-hardware-state__label")
        .text()
        .trim()
    ).toContain("Detecting your Ledger Wallet")
  })
})
